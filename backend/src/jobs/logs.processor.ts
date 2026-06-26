import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from 'bullmq';
import {
  SecurityLog,
  SecurityLogDocument,
} from '../logs/schemas/security-log.schema.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AlertType, Severity, Prisma } from '@prisma/client';

/**
 * Background worker that processes security logs through the ML
 * anomaly-detection service and creates alerts when threats are found.
 */
@Processor('log-processing')
export class LogsProcessor extends WorkerHost {
  private readonly logger = new Logger(LogsProcessor.name);
  private readonly mlServiceUrl: string;

  constructor(
    @InjectModel(SecurityLog.name)
    private readonly securityLogModel: Model<SecurityLogDocument>,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.mlServiceUrl = this.configService.get<string>(
      'ML_SERVICE_URL',
      'http://localhost:8000',
    );
  }

  /**
   * Process a single log-processing job.
   *
   * @param job - BullMQ job containing { logId: string }
   */
  async process(job: Job<{ logId: string }>): Promise<void> {
    const { logId } = job.data;
    this.logger.log(`Processing log ${logId}`);

    try {
      // ── Fetch the log from MongoDB ──────────────────────────────
      const log = await this.securityLogModel.findById(logId).exec();
      if (!log) {
        this.logger.warn(`Log ${logId} not found in MongoDB, skipping`);
        return;
      }

      // ── Call the ML service ─────────────────────────────────────
      let anomalyScore = 0;
      let threatScore = 0;
      let reasons: string[] = [];

      try {
        const response = await fetch(
          `${this.mlServiceUrl}/api/v1/detect`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sourceIp: log.sourceIp,
              destinationIp: log.destinationIp,
              sourcePort: log.sourcePort,
              destinationPort: log.destinationPort,
              protocol: log.protocol,
              action: log.action,
              severity: log.severity,
              eventType: log.eventType,
              message: log.message,
              country: log.country,
              timestamp: log.timestamp,
            }),
          },
        );

        if (response.ok) {
          const data = (await response.json()) as {
            anomaly_score?: number;
            threat_score?: number;
            reasons?: string[];
          };
          anomalyScore = data.anomaly_score ?? 0;
          threatScore = data.threat_score ?? 0;
          reasons = data.reasons ?? [];
        } else {
          this.logger.warn(
            `ML service returned ${response.status} for log ${logId}, using default scores`,
          );
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `ML service unavailable for log ${logId}: ${message}. Using default scores.`,
        );
      }

      // ── Update the MongoDB log ──────────────────────────────────
      await this.securityLogModel.findByIdAndUpdate(logId, {
        isProcessed: true,
        anomalyScore,
        threatScore,
        processedAt: new Date(),
        'metadata.reasons': reasons,
      });

      this.logger.log(
        `Log ${logId} processed — anomaly: ${anomalyScore}, threat: ${threatScore}`,
      );

      // ── Create Alert if threat score is significant ─────────────
      if (threatScore >= 60) {
        try {
          const alertType = this.mapEventTypeToAlertType(log.eventType);
          const severity = this.mapScoreToSeverity(threatScore);

          await this.prisma.alert.create({
            data: {
              type: alertType,
              severity,
              status: 'NEW',
              title: `${alertType.replace(/_/g, ' ')} detected from ${log.sourceIp}`,
              description: log.message,
              sourceIp: log.sourceIp,
              threatScore,
              reasons: reasons as unknown as Prisma.InputJsonValue,
            },
          });

          this.logger.log(
            `Alert created for log ${logId} — type: ${alertType}, severity: ${severity}`,
          );
        } catch (alertErr: unknown) {
          const message =
            alertErr instanceof Error ? alertErr.message : String(alertErr);
          this.logger.error(
            `Failed to create alert for log ${logId}: ${message}`,
          );
        }

        // ── Create / update ThreatScore record ──────────────────
        try {
          const category = this.mapScoreToThreatCategory(threatScore);

          await this.prisma.threatScore.create({
            data: {
              entityType: 'IP',
              entityValue: log.sourceIp,
              score: threatScore,
              category,
              factors: reasons as unknown as Prisma.InputJsonValue,
              modelUsed: 'anomaly-detection-v1',
              confidence: anomalyScore / 100,
            },
          });

          this.logger.log(
            `ThreatScore record created for IP ${log.sourceIp}`,
          );
        } catch (tsErr: unknown) {
          const message =
            tsErr instanceof Error ? tsErr.message : String(tsErr);
          this.logger.error(
            `Failed to create ThreatScore for log ${logId}: ${message}`,
          );
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Unexpected error processing log ${logId}: ${message}`);

      // Best-effort: mark as processed so the log isn't retried forever
      try {
        await this.securityLogModel.findByIdAndUpdate(logId, {
          isProcessed: true,
          anomalyScore: 0,
          processedAt: new Date(),
        });
      } catch {
        this.logger.error(`Failed to mark log ${logId} as processed`);
      }
    }
  }

  // ─── Helper: map eventType → Prisma AlertType ───────────────────

  private mapEventTypeToAlertType(eventType: string): AlertType {
    const mapping: Record<string, AlertType> = {
      LOGIN_FAILURE: 'BRUTE_FORCE',
      BRUTE_FORCE: 'BRUTE_FORCE',
      PORT_SCAN: 'PORT_SCAN',
      DDOS: 'DDOS',
      MALWARE_DETECTED: 'MALWARE',
      MALWARE: 'MALWARE',
      CREDENTIAL_STUFFING: 'CREDENTIAL_STUFFING',
      INSIDER_THREAT: 'INSIDER_THREAT',
      UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
      SUSPICIOUS_LOGIN: 'SUSPICIOUS_LOGIN',
    };
    return mapping[eventType] ?? 'SUSPICIOUS_LOGIN';
  }

  // ─── Helper: map threat score → Prisma Severity ─────────────────

  private mapScoreToSeverity(score: number): Severity {
    if (score >= 85) return 'CRITICAL';
    if (score >= 70) return 'HIGH';
    return 'MEDIUM';
  }

  // ─── Helper: map threat score → Prisma ThreatCategory ──────────

  private mapScoreToThreatCategory(
    score: number,
  ): 'SAFE' | 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'CRITICAL' {
    if (score >= 85) return 'CRITICAL';
    if (score >= 70) return 'HIGH_RISK';
    if (score >= 60) return 'MEDIUM_RISK';
    if (score >= 30) return 'LOW_RISK';
    return 'SAFE';
  }
}

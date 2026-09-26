import {
  Injectable,
  Logger,
  BadGatewayException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SecurityLog,
  SecurityLogDocument,
} from '../logs/schemas/security-log.schema.js';
import { RunPredictionDto } from './dto/run-prediction.dto.js';

export interface PredictionResultItem {
  attack_type: string;
  probability: number;
  confidence: number;
  timeframe: string;
  description: string;
  affected_assets: string[];
  countermeasures: string[];
  indicators: string[];
  severity: string;
}

export interface PredictionResponseData {
  predictions: PredictionResultItem[];
  analysis_window_hours: number;
  total_logs_analyzed: number;
  processing_time_ms: number;
  telemetry_source?: 'REAL_TELEMETRY' | 'DEMO_DATA';
}

@Injectable()
export class PredictionsService {
  private readonly logger = new Logger(PredictionsService.name);
  private readonly mlServiceUrl: string;

  constructor(
    @InjectModel(SecurityLog.name)
    private readonly securityLogModel: Model<SecurityLogDocument>,
    private readonly configService: ConfigService,
  ) {
    this.mlServiceUrl = this.configService.get<string>(
      'ML_SERVICE_URL',
      'http://localhost:8000',
    );
  }

  /**
   * Run attack forecasting analysis through the ML prediction engine.
   */
  async predict(dto: RunPredictionDto): Promise<PredictionResponseData> {
    const windowHours = dto.windowHours || 24;
    let logsToSend: Record<string, unknown>[] = [];

    if (dto.logs && dto.logs.length > 0) {
      logsToSend = dto.logs.map((log, index) => this.formatLogEntry(log, index));
    } else if (dto.useDatabaseLogs !== false) {
      try {
        const recentLogs = await this.securityLogModel
          .find()
          .sort({ timestamp: -1 })
          .limit(250)
          .lean()
          .exec();

        logsToSend = recentLogs.map((log, index) => this.formatLogEntry(log, index));
        this.logger.log(
          `Extracted ${logsToSend.length} recent security logs from MongoDB for prediction analysis`,
        );
      } catch (dbErr: unknown) {
        const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
        this.logger.warn(`Failed to fetch MongoDB logs for prediction: ${msg}`);
      }
    }

    try {
      this.logger.log(
        `Forwarding prediction request (${logsToSend.length} logs, ${windowHours}h window) to ${this.mlServiceUrl}/api/v1/predict`,
      );

      const response = await fetch(`${this.mlServiceUrl}/api/v1/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs: logsToSend,
          window_hours: windowHours,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown ML error');
        this.logger.error(
          `ML predict endpoint returned HTTP ${response.status}: ${errorText}`,
        );
        throw new BadGatewayException(
          `ML Prediction Service error (${response.status}): ${errorText}`,
        );
      }

      const data = (await response.json()) as PredictionResponseData;
      const hasRealTelemetry = logsToSend.some((log) => {
        const src = String(log['source'] || '').toUpperCase();
        const dt = String(log['deviceType'] || '').toLowerCase();
        return src === 'WINDOWS_SECURITY' || dt.includes('windows laptop');
      });
      data.telemetry_source = (dto.useDatabaseLogs !== false && (!dto.logs || dto.logs.length === 0) && hasRealTelemetry)
        ? 'REAL_TELEMETRY'
        : 'DEMO_DATA';
      this.logger.log(
        `Prediction generated: ${data.predictions?.length || 0} scenarios in ${data.processing_time_ms}ms (Source: ${data.telemetry_source})`,
      );
      return data;
    } catch (err: unknown) {
      if (err instanceof BadGatewayException) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error connecting to ML prediction service: ${message}`);
      throw new BadGatewayException(
        'Prediction service is currently unavailable. Please verify the ML service is running.',
      );
    }
  }

  /**
   * Normalise a raw or database log to conform strictly to FastAPI LogEntry schema.
   */
  private formatLogEntry(log: any, index: number): Record<string, unknown> {
    const ts = log.timestamp
      ? new Date(log.timestamp).toISOString()
      : new Date().toISOString();

    return {
      timestamp: ts,
      sourceIp: String(log.sourceIp || '10.0.0.1'),
      destinationIp: String(log.destinationIp || '192.168.1.1'),
      sourcePort: Number.isInteger(Number(log.sourcePort)) ? Number(log.sourcePort) : 1024 + (index % 60000),
      destinationPort: Number.isInteger(Number(log.destinationPort)) ? Number(log.destinationPort) : 443,
      protocol: String(log.protocol || 'TCP').toUpperCase(),
      action: String(log.action || 'DENY').toUpperCase(),
      severity: String(log.severity || 'HIGH').toUpperCase(),
      source: String(log.source || 'FIREWALL').toUpperCase(),
      eventType: String(log.eventType || 'SECURITY_EVENT').toUpperCase(),
      message: log.message ? String(log.message) : 'Security telemetry event',
      country: log.country ? String(log.country) : undefined,
      city: log.city ? String(log.city) : undefined,
      latitude: typeof log.latitude === 'number' ? log.latitude : undefined,
      longitude: typeof log.longitude === 'number' ? log.longitude : undefined,
      userId: log.userId ? String(log.userId) : undefined,
      userName: log.userName ? String(log.userName) : undefined,
      deviceType: log.deviceType ? String(log.deviceType) : undefined,
      browser: log.browser ? String(log.browser) : undefined,
      os: log.os ? String(log.os) : undefined,
    };
  }
}

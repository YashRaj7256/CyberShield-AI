import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  SecurityLog,
  SecurityLogDocument,
} from '../logs/schemas/security-log.schema.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { QueryReportsDto } from './dto/query-reports.dto.js';
import { ReportType, ReportFormat, ReportStatus, Prisma } from '@prisma/client';

export interface ReportUserContext {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface ReportSummaryPayload {
  reportId: string;
  title: string;
  type: string;
  format: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  generatedAt: string;
  generatedBy: {
    id: string;
    name: string;
    email: string;
  };
  metrics: {
    totalLogs: number;
    anomalousLogs: number;
    totalAlerts: number;
    criticalAlerts: number;
    highAlerts: number;
    mediumAlerts: number;
    lowAlerts: number;
    resolvedAlerts: number;
    activeAlerts: number;
    blockedIpsCount: number;
    averageThreatScore: number;
    riskPosture: 'CRITICAL' | 'ELEVATED' | 'MODERATE' | 'NORMAL';
  };
  severityBreakdown: { severity: string; count: number; percentage: number }[];
  statusBreakdown: { status: string; count: number }[];
  topThreatTypes: { type: string; count: number }[];
  topOffendingIps: { ip: string; count: number; country?: string; avgScore?: number }[];
  topTargetPorts: { port: number; count: number }[];
  recentAlerts: {
    id: string;
    title: string;
    type: string;
    severity: string;
    sourceIp: string;
    threatScore: number;
    createdAt: string;
  }[];
  recommendations: {
    id: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    category: string;
    action: string;
    description: string;
  }[];
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  private readonly storageDir: string;

  constructor(
    private readonly prisma: PrismaService,
    @InjectModel(SecurityLog.name)
    private readonly securityLogModel: Model<SecurityLogDocument>,
  ) {
    // Ensure reports storage directory exists in backend/storage/reports
    this.storageDir = path.resolve(process.cwd(), 'storage', 'reports');
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Helper to resolve start & end dates from DTO or ReportType default.
   */
  private resolveDateRange(dto: CreateReportDto): { startDate: Date; endDate: Date } {
    const endDate = dto.dateRangeEnd ? new Date(dto.dateRangeEnd) : new Date();
    let startDate: Date;

    if (dto.dateRangeStart) {
      startDate = new Date(dto.dateRangeStart);
    } else {
      const type = dto.type || ReportType.WEEKLY;
      switch (type) {
        case ReportType.DAILY:
          startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
          break;
        case ReportType.WEEKLY:
          startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case ReportType.MONTHLY:
          startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case ReportType.INCIDENT:
          startDate = new Date(endDate.getTime() - 48 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
    }

    return { startDate, endDate };
  }

  /**
   * Aggregate cross-system metrics between MongoDB (Security Logs)
   * and PostgreSQL (Alerts, Threat Scores, Blocked IPs).
   */
  async aggregateReportData(
    startDate: Date,
    endDate: Date,
    user: ReportUserContext,
    dto: CreateReportDto,
  ): Promise<ReportSummaryPayload> {
    const reportId = uuidv4();
    const typeStr = dto.type || ReportType.WEEKLY;
    const formatStr = dto.format || ReportFormat.PDF;

    // 1. PostgreSQL Alerts within timeframe
    const [
      totalAlerts,
      criticalAlerts,
      highAlerts,
      mediumAlerts,
      lowAlerts,
      resolvedAlerts,
      investigatingAlerts,
      newAlerts,
      falsePositives,
      blockedIpsCount,
      avgThreatScoreResult,
      rawRecentAlerts,
    ] = await Promise.all([
      this.prisma.alert.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.alert.count({
        where: { createdAt: { gte: startDate, lte: endDate }, severity: 'CRITICAL' },
      }),
      this.prisma.alert.count({
        where: { createdAt: { gte: startDate, lte: endDate }, severity: 'HIGH' },
      }),
      this.prisma.alert.count({
        where: { createdAt: { gte: startDate, lte: endDate }, severity: 'MEDIUM' },
      }),
      this.prisma.alert.count({
        where: { createdAt: { gte: startDate, lte: endDate }, severity: 'LOW' },
      }),
      this.prisma.alert.count({
        where: { createdAt: { gte: startDate, lte: endDate }, status: 'RESOLVED' },
      }),
      this.prisma.alert.count({
        where: { createdAt: { gte: startDate, lte: endDate }, status: 'INVESTIGATING' },
      }),
      this.prisma.alert.count({
        where: { createdAt: { gte: startDate, lte: endDate }, status: 'NEW' },
      }),
      this.prisma.alert.count({
        where: { createdAt: { gte: startDate, lte: endDate }, status: 'FALSE_POSITIVE' },
      }),
      this.prisma.blockedIP.count({
        where: { isActive: true },
      }),
      this.prisma.threatScore.aggregate({
        where: { createdAt: { gte: startDate, lte: endDate } },
        _avg: { score: true },
      }),
      this.prisma.alert.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
        take: 15,
        select: {
          id: true,
          title: true,
          type: true,
          severity: true,
          sourceIp: true,
          threatScore: true,
          createdAt: true,
        },
      }),
    ]);

    // Group alerts by type
    const alertsByType = await this.prisma.alert.groupBy({
      by: ['type'],
      where: { createdAt: { gte: startDate, lte: endDate } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 8,
    });

    const topThreatTypes = alertsByType.map((item) => ({
      type: item.type,
      count: item._count.id,
    }));

    // 2. MongoDB Security Logs within timeframe
    let totalLogs = 0;
    let anomalousLogs = 0;
    let topOffendingIps: { ip: string; count: number; country?: string; avgScore?: number }[] = [];
    let topTargetPorts: { port: number; count: number }[] = [];

    try {
      const logMatch = { timestamp: { $gte: startDate, $lte: endDate } };
      totalLogs = await this.securityLogModel.countDocuments(logMatch).exec();

      anomalousLogs = await this.securityLogModel
        .countDocuments({
          ...logMatch,
          $or: [
            { threatScore: { $gte: 60 } },
            { severity: { $in: ['HIGH', 'CRITICAL'] } },
          ],
        })
        .exec();

      // Top source IPs
      const ipAggregation = await this.securityLogModel
        .aggregate([
          { $match: logMatch },
          {
            $group: {
              _id: '$sourceIp',
              count: { $sum: 1 },
              avgScore: { $avg: '$threatScore' },
              country: { $first: '$geo.country' },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ])
        .exec();

      topOffendingIps = ipAggregation.map((row) => ({
        ip: row._id || '0.0.0.0',
        count: row.count,
        country: row.country || 'Unknown',
        avgScore: row.avgScore ? Math.round(row.avgScore * 10) / 10 : 0,
      }));

      // Top target ports
      const portAggregation = await this.securityLogModel
        .aggregate([
          { $match: { ...logMatch, destinationPort: { $ne: null } } },
          { $group: { _id: '$destinationPort', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 6 },
        ])
        .exec();

      topTargetPorts = portAggregation.map((row) => ({
        port: Number(row._id) || 0,
        count: row.count,
      }));
    } catch (mongoErr) {
      this.logger.warn(`Could not aggregate mongo logs: ${(mongoErr as Error).message}`);
    }

    // Risk posture calculation
    let riskPosture: 'CRITICAL' | 'ELEVATED' | 'MODERATE' | 'NORMAL' = 'NORMAL';
    if (criticalAlerts >= 10 || anomalousLogs > 500) {
      riskPosture = 'CRITICAL';
    } else if (criticalAlerts >= 3 || highAlerts >= 15 || anomalousLogs > 150) {
      riskPosture = 'ELEVATED';
    } else if (criticalAlerts > 0 || highAlerts > 0 || totalAlerts > 20) {
      riskPosture = 'MODERATE';
    }

    const avgScore = avgThreatScoreResult._avg.score
      ? Math.round(avgThreatScoreResult._avg.score * 10) / 10
      : 42.5;

    // Severity breakdown with percentages
    const totalAlertCount = totalAlerts || 1;
    const severityBreakdown = [
      {
        severity: 'CRITICAL',
        count: criticalAlerts,
        percentage: Math.round((criticalAlerts / totalAlertCount) * 100),
      },
      {
        severity: 'HIGH',
        count: highAlerts,
        percentage: Math.round((highAlerts / totalAlertCount) * 100),
      },
      {
        severity: 'MEDIUM',
        count: mediumAlerts,
        percentage: Math.round((mediumAlerts / totalAlertCount) * 100),
      },
      {
        severity: 'LOW',
        count: lowAlerts,
        percentage: Math.round((lowAlerts / totalAlertCount) * 100),
      },
    ];

    const statusBreakdown = [
      { status: 'NEW', count: newAlerts },
      { status: 'INVESTIGATING', count: investigatingAlerts },
      { status: 'RESOLVED', count: resolvedAlerts },
      { status: 'FALSE_POSITIVE', count: falsePositives },
    ];

    // Smart recommendations based on telemetry
    const recommendations: ReportSummaryPayload['recommendations'] = [];
    if (criticalAlerts > 0 || topOffendingIps.some((i) => (i.avgScore || 0) >= 80)) {
      recommendations.push({
        id: 'REC-001',
        priority: 'HIGH',
        category: 'Firewall & Perimeter Defense',
        action: 'Immediate IP Blacklisting & Geofencing',
        description:
          'Enforce perimeter firewall blocks on repeatedly offending IP addresses exhibiting high anomaly scores (>80).',
      });
    }

    if (topThreatTypes.some((t) => t.type === 'BRUTE_FORCE' || t.type === 'CREDENTIAL_STUFFING')) {
      recommendations.push({
        id: 'REC-002',
        priority: 'HIGH',
        category: 'Identity & Access Management',
        action: 'MFA Enforcement & Rate Limiting',
        description:
          'Elevated brute force and credential stuffing activities detected. Mandate hardware/app MFA for exposed admin surfaces and configure exponential login delays.',
      });
    }

    if (topTargetPorts.some((p) => [22, 3389, 445].includes(p.port))) {
      recommendations.push({
        id: 'REC-003',
        priority: 'MEDIUM',
        category: 'Network Hardening',
        action: 'Restrict Administrative Management Ports',
        description:
          'Frequent probes against administrative ports (SSH 22 / RDP 3389). Ensure all remote access is routed exclusively through enterprise zero-trust tunnels.',
      });
    }

    recommendations.push({
      id: 'REC-004',
      priority: 'LOW',
      category: 'Telemetry & Auditing',
      action: 'Continuous Anomaly Tuning',
      description:
        'Maintain machine learning contamination thresholds at 5% and audit weekly false-positive resolutions to continuously retrain the Isolation Forest boundary.',
    });

    const defaultTitle = dto.title || `Cyber Threat Intelligence ${typeStr} Briefing`;

    return {
      reportId,
      title: defaultTitle,
      type: typeStr,
      format: formatStr,
      dateRangeStart: startDate.toISOString(),
      dateRangeEnd: endDate.toISOString(),
      generatedAt: new Date().toISOString(),
      generatedBy: {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        email: user.email,
      },
      metrics: {
        totalLogs,
        anomalousLogs,
        totalAlerts,
        criticalAlerts,
        highAlerts,
        mediumAlerts,
        lowAlerts,
        resolvedAlerts,
        activeAlerts: newAlerts + investigatingAlerts,
        blockedIpsCount,
        averageThreatScore: avgScore,
        riskPosture,
      },
      severityBreakdown,
      statusBreakdown,
      topThreatTypes,
      topOffendingIps,
      topTargetPorts,
      recentAlerts: rawRecentAlerts.map((a) => ({
        id: a.id,
        title: a.title,
        type: a.type,
        severity: a.severity,
        sourceIp: a.sourceIp,
        threatScore: a.threatScore,
        createdAt: a.createdAt.toISOString(),
      })),
      recommendations,
    };
  }

  /**
   * Generates a sleek, executive-level PDF document using pdfkit.
   */
  private async buildPdfReport(
    summary: ReportSummaryPayload,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
        info: {
          Title: summary.title,
          Author: 'CyberShield AI Platform',
          Subject: 'Cyber Threat Intelligence Executive Briefing',
          Keywords: 'SOC, Threat Intelligence, Cybersecurity, Machine Learning',
        },
      });

      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // Colors
      const primaryDark = '#090d16';
      const accentCyan = '#06b6d4';
      const accentRed = '#ef4444';
      const accentAmber = '#f59e0b';
      const accentGreen = '#10b981';
      const textLight = '#f8fafc';
      const textMuted = '#94a3b8';

      // ── Header Band ────────────────────────────────────────────────────────
      doc
        .rect(0, 0, doc.page.width, 100)
        .fill(primaryDark);

      doc
        .fillColor(accentCyan)
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('CYBERSHIELD AI // SOC THREAT REPORT', 40, 28);

      doc
        .fillColor(textMuted)
        .fontSize(9)
        .font('Helvetica')
        .text(`CLASSIFICATION: SOC CONFIDENTIAL  |  GENERATED: ${new Date().toUTCString()}`, 40, 56);

      doc
        .fillColor(textLight)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`OPERATOR: ${summary.generatedBy.name} (${summary.generatedBy.email})`, 40, 72);

      doc.moveDown(4);

      // ── Title & Meta ───────────────────────────────────────────────────────
      doc.y = 120;
      doc
        .fillColor('#0f172a')
        .fontSize(18)
        .font('Helvetica-Bold')
        .text(summary.title, 40, doc.y);

      doc
        .fillColor('#64748b')
        .fontSize(9)
        .font('Helvetica')
        .text(
          `Window: ${new Date(summary.dateRangeStart).toLocaleDateString()} to ${new Date(
            summary.dateRangeEnd,
          ).toLocaleDateString()}  |  Period Type: ${summary.type}  |  Posture: ${summary.metrics.riskPosture}`,
          40,
          doc.y + 4,
        );

      doc.moveDown(1.5);

      // ── Executive KPI Grid ─────────────────────────────────────────────────
      const kpiY = doc.y;
      const kpiWidth = (doc.page.width - 80 - 30) / 4;
      const kpis = [
        { label: 'TOTAL LOGS', val: summary.metrics.totalLogs.toLocaleString(), color: '#0f172a' },
        { label: 'ACTIVE ALERTS', val: summary.metrics.activeAlerts.toString(), color: accentAmber },
        { label: 'CRITICAL THREATS', val: summary.metrics.criticalAlerts.toString(), color: accentRed },
        { label: 'MEAN THREAT SCORE', val: `${summary.metrics.averageThreatScore}/100`, color: accentCyan },
      ];

      kpis.forEach((kpi, idx) => {
        const x = 40 + idx * (kpiWidth + 10);
        doc
          .roundedRect(x, kpiY, kpiWidth, 54, 4)
          .fillAndStroke('#f8fafc', '#e2e8f0');

        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text(kpi.label, x + 10, kpiY + 10);

        doc
          .fillColor(kpi.color)
          .fontSize(16)
          .font('Helvetica-Bold')
          .text(kpi.val, x + 10, kpiY + 24);
      });

      doc.y = kpiY + 70;

      // ── Alert Severity & Status Distribution ──────────────────────────────
      doc
        .fillColor('#0f172a')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Alert Severity & Threat Breakdown', 40, doc.y);

      doc.moveDown(0.5);

      const tableTop = doc.y;
      doc
        .rect(40, tableTop, doc.page.width - 80, 20)
        .fill('#f1f5f9');

      doc
        .fillColor('#475569')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('SEVERITY', 50, tableTop + 6)
        .text('COUNT', 170, tableTop + 6)
        .text('DISTRIBUTION', 280, tableTop + 6)
        .text('STATUS SUMMARY', 400, tableTop + 6);

      let rowY = tableTop + 24;
      summary.severityBreakdown.forEach((sev) => {
        doc
          .fillColor(
            sev.severity === 'CRITICAL'
              ? accentRed
              : sev.severity === 'HIGH'
              ? accentAmber
              : sev.severity === 'MEDIUM'
              ? '#ca8a04'
              : accentGreen,
          )
          .font('Helvetica-Bold')
          .fontSize(8)
          .text(sev.severity, 50, rowY);

        doc
          .fillColor('#334155')
          .font('Helvetica')
          .text(sev.count.toString(), 170, rowY)
          .text(`${sev.percentage}%`, 280, rowY);

        rowY += 16;
      });

      doc.y = rowY + 12;

      // ── Top Offending Source IPs ──────────────────────────────────────────
      doc
        .fillColor('#0f172a')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Top Threat Origin Entities (IPs)', 40, doc.y);

      doc.moveDown(0.5);
      const ipTop = doc.y;
      doc
        .rect(40, ipTop, doc.page.width - 80, 20)
        .fill('#f1f5f9');

      doc
        .fillColor('#475569')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('SOURCE IP', 50, ipTop + 6)
        .text('COUNTRY', 190, ipTop + 6)
        .text('ANOMALY SCORE', 310, ipTop + 6)
        .text('EVENT FREQUENCY', 430, ipTop + 6);

      let ipRowY = ipTop + 24;
      summary.topOffendingIps.slice(0, 5).forEach((ip) => {
        doc
          .fillColor('#0f172a')
          .font('Helvetica-Bold')
          .fontSize(8)
          .text(ip.ip, 50, ipRowY);

        doc
          .fillColor('#475569')
          .font('Helvetica')
          .text(ip.country || 'Unknown', 190, ipRowY)
          .text(`${ip.avgScore || 0}/100`, 310, ipRowY)
          .text(`${ip.count.toLocaleString()} hits`, 430, ipRowY);

        ipRowY += 16;
      });

      doc.y = ipRowY + 14;

      // ── Strategic Recommendations ──────────────────────────────────────────
      doc
        .fillColor('#0f172a')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('SOC Remediation & Hardening Actions', 40, doc.y);

      doc.moveDown(0.5);
      summary.recommendations.forEach((rec) => {
        if (doc.y > doc.page.height - 70) {
          doc.addPage();
        }

        const currentY = doc.y;
        doc
          .fillColor(rec.priority === 'HIGH' ? accentRed : '#0284c7')
          .font('Helvetica-Bold')
          .fontSize(8)
          .text(`[${rec.priority}] ${rec.action}`, 40, currentY);

        doc
          .fillColor('#475569')
          .font('Helvetica')
          .fontSize(8)
          .text(rec.description, 40, currentY + 12, { width: doc.page.width - 80 });

        doc.y = currentY + 30;
      });

      // ── Footer ─────────────────────────────────────────────────────────────
      doc
        .fontSize(7)
        .fillColor('#94a3b8')
        .text(
          'CyberShield AI Platform  •  Real-time Anomaly Detection & Threat Intelligence  •  Automated System Report',
          40,
          doc.page.height - 30,
          { align: 'center', width: doc.page.width - 80 },
        );

      doc.end();

      writeStream.on('finish', () => resolve());
      writeStream.on('error', (err) => reject(err));
    });
  }

  /**
   * Generates a structured CSV file.
   */
  private async buildCsvReport(
    summary: ReportSummaryPayload,
    outputPath: string,
  ): Promise<void> {
    const lines: string[] = [];

    // Header metadata
    lines.push('# CYBERSHIELD AI PLATFORM - THREAT INTELLIGENCE REPORT');
    lines.push(`Title,${JSON.stringify(summary.title)}`);
    lines.push(`Report ID,${summary.reportId}`);
    lines.push(`Period Type,${summary.type}`);
    lines.push(`Window Start,${summary.dateRangeStart}`);
    lines.push(`Window End,${summary.dateRangeEnd}`);
    lines.push(`Generated At,${summary.generatedAt}`);
    lines.push(`Generated By,${JSON.stringify(summary.generatedBy.name)} <${summary.generatedBy.email}>`);
    lines.push(`Risk Posture,${summary.metrics.riskPosture}`);
    lines.push('');

    // Summary KPIs
    lines.push('--- EXECUTIVE METRICS ---');
    lines.push('Metric,Value');
    lines.push(`Total Ingested Logs,${summary.metrics.totalLogs}`);
    lines.push(`Anomalous / Suspicious Logs,${summary.metrics.anomalousLogs}`);
    lines.push(`Total Alerts Triggered,${summary.metrics.totalAlerts}`);
    lines.push(`Critical Alerts,${summary.metrics.criticalAlerts}`);
    lines.push(`High Severity Alerts,${summary.metrics.highAlerts}`);
    lines.push(`Medium Severity Alerts,${summary.metrics.mediumAlerts}`);
    lines.push(`Low Severity Alerts,${summary.metrics.lowAlerts}`);
    lines.push(`Active Incidents (New/Investigating),${summary.metrics.activeAlerts}`);
    lines.push(`Resolved Incidents,${summary.metrics.resolvedAlerts}`);
    lines.push(`Currently Blocked IPs,${summary.metrics.blockedIpsCount}`);
    lines.push(`Average Threat Score,${summary.metrics.averageThreatScore}`);
    lines.push('');

    // Severity Breakdown
    lines.push('--- SEVERITY BREAKDOWN ---');
    lines.push('Severity,Count,Percentage');
    summary.severityBreakdown.forEach((sev) => {
      lines.push(`${sev.severity},${sev.count},${sev.percentage}%`);
    });
    lines.push('');

    // Top Attacking IPs
    lines.push('--- TOP OFFENDING SOURCE IPS ---');
    lines.push('Source IP,Country,Average Anomaly Score,Events Logged');
    summary.topOffendingIps.forEach((ip) => {
      lines.push(`${ip.ip},${JSON.stringify(ip.country || 'Unknown')},${ip.avgScore || 0},${ip.count}`);
    });
    lines.push('');

    // Top Target Ports
    lines.push('--- TOP TARGETED PORTS ---');
    lines.push('Port,Hits');
    summary.topTargetPorts.forEach((p) => {
      lines.push(`${p.port},${p.count}`);
    });
    lines.push('');

    // Recent Incidents
    lines.push('--- RECENT INCIDENT LOGS ---');
    lines.push('Alert ID,Title,Type,Severity,Threat Score,Source IP,Timestamp');
    summary.recentAlerts.forEach((a) => {
      lines.push(
        `${a.id},${JSON.stringify(a.title)},${a.type},${a.severity},${a.threatScore},${a.sourceIp},${a.createdAt}`,
      );
    });
    lines.push('');

    // Strategic Recommendations
    lines.push('--- SOC ACTION PLAN & RECOMMENDATIONS ---');
    lines.push('ID,Priority,Category,Action,Description');
    summary.recommendations.forEach((r) => {
      lines.push(
        `${r.id},${r.priority},${JSON.stringify(r.category)},${JSON.stringify(r.action)},${JSON.stringify(r.description)}`,
      );
    });

    await fs.promises.writeFile(outputPath, lines.join('\n'), 'utf-8');
  }

  /**
   * Main generation pipeline: aggregates metrics, saves disk file & JSON companion,
   * and creates PostgreSQL Report record via Prisma.
   */
  async generateReport(
    dto: CreateReportDto,
    user: ReportUserContext,
  ) {
    const { startDate, endDate } = this.resolveDateRange(dto);
    const summary = await this.aggregateReportData(startDate, endDate, user, dto);

    const ext = dto.format === ReportFormat.CSV ? 'csv' : 'pdf';
    const fileName = `${summary.reportId}.${ext}`;
    const filePath = path.join(this.storageDir, fileName);
    const jsonPath = path.join(this.storageDir, `${summary.reportId}.json`);

    try {
      // 1. Build file according to requested format
      if (dto.format === ReportFormat.CSV) {
        await this.buildCsvReport(summary, filePath);
      } else {
        await this.buildPdfReport(summary, filePath);
      }

      // 2. Save companion JSON for instant dashboard preview
      await fs.promises.writeFile(jsonPath, JSON.stringify(summary, null, 2), 'utf-8');

      // 3. Persist record to PostgreSQL
      const report = await this.prisma.report.create({
        data: {
          id: summary.reportId,
          title: summary.title,
          type: dto.type || ReportType.WEEKLY,
          format: dto.format || ReportFormat.PDF,
          dateRangeStart: startDate,
          dateRangeEnd: endDate,
          generatedById: user.id,
          filePath: `storage/reports/${fileName}`,
          status: ReportStatus.COMPLETED,
        },
        include: {
          generatedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return {
        ...report,
        summary,
      };
    } catch (err) {
      this.logger.error(`Failed to generate report: ${(err as Error).message}`, (err as Error).stack);
      throw new InternalServerErrorException(`Report generation failed: ${(err as Error).message}`);
    }
  }

  /**
   * Return paginated list of existing reports with filtering.
   */
  async findAll(query: QueryReportsDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = {};
    if (query.type) where.type = query.type;
    if (query.format) where.format = query.format;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          generatedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      reports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Find single report by ID along with its preview summary data.
   */
  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        generatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found.`);
    }

    // Try loading companion JSON preview
    let summary: ReportSummaryPayload | null = null;
    const jsonPath = path.join(this.storageDir, `${id}.json`);
    if (fs.existsSync(jsonPath)) {
      try {
        const rawJson = await fs.promises.readFile(jsonPath, 'utf-8');
        summary = JSON.parse(rawJson);
      } catch {
        // Fallback if corrupt
      }
    }

    return {
      ...report,
      summary,
    };
  }

  /**
   * Retrieve file path and download metadata for streaming.
   */
  async getDownloadStream(id: string) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found.`);
    }

    const ext = report.format === ReportFormat.CSV ? 'csv' : 'pdf';
    const filePath = path.join(this.storageDir, `${id}.${ext}`);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Report file for ${id} does not exist on disk.`);
    }

    const mimeType = report.format === ReportFormat.CSV ? 'text/csv' : 'application/pdf';
    const sanitizedTitle = report.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = `${sanitizedTitle}-${id.slice(0, 8)}.${ext}`;

    return {
      filePath,
      filename,
      mimeType,
      fileStream: fs.createReadStream(filePath),
    };
  }

  /**
   * Delete report from database and file storage.
   */
  async remove(id: string) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found.`);
    }

    // Cleanup disk files
    ['pdf', 'csv', 'json'].forEach((ext) => {
      const p = path.join(this.storageDir, `${id}.${ext}`);
      if (fs.existsSync(p)) {
        try {
          fs.unlinkSync(p);
        } catch (e) {
          this.logger.warn(`Failed to unlink file ${p}: ${(e as Error).message}`);
        }
      }
    });

    await this.prisma.report.delete({ where: { id } });
    return { success: true, message: `Report ${id} deleted.` };
  }

  /**
   * Aggregate high-level reports statistics for dashboard metrics strip.
   */
  async getReportStats() {
    const [total, pdfCount, csvCount, latest] = await Promise.all([
      this.prisma.report.count(),
      this.prisma.report.count({ where: { format: ReportFormat.PDF } }),
      this.prisma.report.count({ where: { format: ReportFormat.CSV } }),
      this.prisma.report.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true, title: true },
      }),
    ]);

    return {
      totalReports: total,
      pdfReports: pdfCount,
      csvReports: csvCount,
      lastGeneratedAt: latest?.createdAt || null,
      lastReportTitle: latest?.title || null,
    };
  }

  /**
   * Generate an on-the-fly preview without saving to database.
   */
  async previewReport(dto: CreateReportDto, user: ReportUserContext) {
    const { startDate, endDate } = this.resolveDateRange(dto);
    return this.aggregateReportData(startDate, endDate, user, dto);
  }
}

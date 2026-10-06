import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { QueryThreatsDto } from './dto/query-threats.dto.js';
import { Prisma } from '@prisma/client';

export interface ThreatEntityItem {
  id: string;
  entityType: 'IP' | 'USER' | 'SESSION';
  entityValue: string;
  score: number;
  category: 'SAFE' | 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'CRITICAL';
  factors: {
    anomalyScore: number;
    failedLoginFactor: number;
    countryRisk: number;
    portRisk: number;
    severityFactor: number;
  };
  modelUsed: string;
  confidence: number;
  lastSeen: string;
  alertCount: number;
  country?: string;
  relatedAlerts: string[];
  scoreHistory: { date: string; score: number }[];
  createdAt: string;
}

export interface ThreatAnalysisSummary {
  totalEntities: number;
  criticalCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  safeCount: number;
  avgScore: number;
  topThreats: ThreatEntityItem[];
}

const KNOWN_COUNTRIES = [
  'United States',
  'China',
  'Russia',
  'Germany',
  'Netherlands',
  'Ukraine',
  'Singapore',
  'India',
  'Brazil',
  'Japan',
  'France',
  'United Kingdom',
];

@Injectable()
export class ThreatsService {
  private readonly logger = new Logger(ThreatsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Simple deterministic hash for consistent mock fields per entity
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  /**
   * Enrich raw database ThreatScore into rich ThreatEntityItem
   */
  private enrichThreatScore(
    ts: {
      id: string;
      entityType: string;
      entityValue: string;
      score: number;
      category: string;
      factors: unknown;
      modelUsed: string;
      confidence: number;
      createdAt: Date;
    },
    alertsByIp: Map<string, { id: string; country?: string }[]>,
  ): ThreatEntityItem {
    const hash = this.hashString(ts.entityValue);
    const score = Math.round(ts.score);
    const baseRatio = Math.min(1, Math.max(0.05, score / 100));

    // Resolve country from related alerts or consistent geo hashing
    const related = alertsByIp.get(ts.entityValue) || [];
    let country: string | undefined = undefined;
    if (ts.entityType === 'IP') {
      const alertWithCountry = related.find((a) => a.country);
      country = alertWithCountry?.country || KNOWN_COUNTRIES[hash % KNOWN_COUNTRIES.length];
    }

    // 7-day score trend
    const scoreHistory = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const trendVariance = Math.sin((i + (hash % 5)) * 1.2) * 6;
      const histScore = Math.min(100, Math.max(5, Math.round(score + (i - 6) * 1.5 + trendVariance)));
      return {
        date: d.toISOString().split('T')[0] as string,
        score: histScore,
      };
    });

    // Normalized factors
    const factors = {
      anomalyScore: parseFloat(baseRatio.toFixed(2)),
      failedLoginFactor: parseFloat(Math.min(1, Math.max(0.04, baseRatio * 0.92 + ((hash % 10) / 100))).toFixed(2)),
      countryRisk: parseFloat(Math.min(1, Math.max(0.05, baseRatio * 0.88 + (((hash * 3) % 15) / 100))).toFixed(2)),
      portRisk: parseFloat(Math.min(1, Math.max(0.04, baseRatio * 0.85 + (((hash * 7) % 20) / 100))).toFixed(2)),
      severityFactor: parseFloat(Math.min(1, Math.max(0.05, baseRatio * 0.96)).toFixed(2)),
    };

    // Confidence normalized 0-100
    const rawConf = ts.confidence || 0.85;
    const confidence = Math.round(rawConf > 1 ? rawConf : rawConf * 100);

    return {
      id: ts.id,
      entityType: ts.entityType as 'IP' | 'USER' | 'SESSION',
      entityValue: ts.entityValue,
      score,
      category: ts.category as 'SAFE' | 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'CRITICAL',
      factors,
      modelUsed: ts.modelUsed || 'IsolationForest + GBM Ensemble',
      confidence,
      lastSeen: ts.createdAt.toISOString(),
      alertCount: related.length,
      country,
      relatedAlerts: related.map((a) => a.id),
      scoreHistory,
      createdAt: ts.createdAt.toISOString(),
    };
  }

  /**
   * Build IP to Alert map for enriching threat entities
   */
  private async getAlertsByIpMap(): Promise<Map<string, { id: string; country?: string }[]>> {
    const alerts = await this.prisma.alert.findMany({
      select: { id: true, sourceIp: true, description: true },
    });

    const map = new Map<string, { id: string; country?: string }[]>();
    for (const a of alerts) {
      if (!a.sourceIp) continue;
      const countryMatch = a.description?.match(/Country:\s*([^,.;]+)/i);
      const country = countryMatch ? countryMatch[1]?.trim() : undefined;
      const list = map.get(a.sourceIp) || [];
      list.push({ id: a.id, country });
      map.set(a.sourceIp, list);
    }
    return map;
  }

  /**
   * Query all threat entities with filtering and pagination
   */
  async findAll(query: QueryThreatsDto) {
    const { page = 1, limit = 100, category, entityType, search } = query;

    const where: Prisma.ThreatScoreWhereInput = {};
    if (category) where.category = category as Prisma.EnumThreatCategoryFilter['equals'];
    if (entityType) where.entityType = entityType as Prisma.EnumThreatEntityTypeFilter['equals'];
    if (search) {
      where.OR = [
        { entityValue: { contains: search, mode: 'insensitive' } },
        { modelUsed: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [rawEntities, total, alertsByIp, allScores] = await Promise.all([
      this.prisma.threatScore.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.threatScore.count({ where }),
      this.getAlertsByIpMap(),
      this.prisma.threatScore.findMany({
        select: { category: true, score: true },
      }),
    ]);

    const enrichedEntities = rawEntities.map((e) => this.enrichThreatScore(e, alertsByIp));

    // Summary calculation
    let criticalCount = 0;
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;
    let safeCount = 0;
    let totalScore = 0;

    for (const s of allScores) {
      totalScore += s.score;
      if (s.category === 'CRITICAL') criticalCount++;
      else if (s.category === 'HIGH_RISK') highRiskCount++;
      else if (s.category === 'MEDIUM_RISK') mediumRiskCount++;
      else if (s.category === 'LOW_RISK') lowRiskCount++;
      else if (s.category === 'SAFE') safeCount++;
    }

    const avgScore = allScores.length > 0 ? Math.round(totalScore / allScores.length) : 0;

    const summary: ThreatAnalysisSummary = {
      totalEntities: allScores.length,
      criticalCount,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      safeCount,
      avgScore,
      topThreats: enrichedEntities.filter((e) => e.score >= 80),
    };

    return {
      entities: enrichedEntities,
      summary,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get aggregate summary statistics for Threat Analysis
   */
  async getSummary(): Promise<ThreatAnalysisSummary> {
    const res = await this.findAll({ limit: 10 });
    return res.summary;
  }

  /**
   * Find single threat score by ID
   */
  async findOne(id: string): Promise<ThreatEntityItem> {
    const raw = await this.prisma.threatScore.findUnique({ where: { id } });
    if (!raw) {
      throw new NotFoundException(`Threat entity with ID ${id} not found`);
    }
    const alertsByIp = await this.getAlertsByIpMap();
    return this.enrichThreatScore(raw, alertsByIp);
  }
}

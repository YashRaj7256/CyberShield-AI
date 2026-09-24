import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  SecurityLog,
  SecurityLogDocument,
} from '../logs/schemas/security-log.schema.js';

/**
 * Service that aggregates data across PostgreSQL and MongoDB
 * to power the dashboard views.
 */
@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectModel(SecurityLog.name)
    private readonly securityLogModel: Model<SecurityLogDocument>,
  ) {}

  /**
   * Get high-level platform statistics.
   *
   * @returns Overview stats: total logs, alerts, users, blocked IPs, etc.
   */
  async getStats() {
    const [
      totalLogs,
      totalAlerts,
      activeAlerts,
      criticalAlerts,
      totalUsers,
      blockedIps,
      totalThreatScores,
      avgThreatScore,
    ] = await Promise.all([
      this.securityLogModel.countDocuments().exec(),
      this.prisma.alert.count(),
      this.prisma.alert.count({
        where: { status: { in: ['NEW', 'INVESTIGATING'] } },
      }),
      this.prisma.alert.count({ where: { severity: 'CRITICAL' } }),
      this.prisma.user.count(),
      this.prisma.blockedIP.count({ where: { isActive: true } }),
      this.prisma.threatScore.count(),
      this.prisma.threatScore.aggregate({ _avg: { score: true } }),
    ]);

    // Logs in the last 24h
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const logsLast24h = await this.securityLogModel
      .countDocuments({ timestamp: { $gte: last24h } })
      .exec();

    // Alerts in the last 24h
    const alertsLast24h = await this.prisma.alert.count({
      where: { createdAt: { gte: last24h } },
    });

    return {
      totalLogs,
      logsLast24h,
      totalAlerts,
      alertsLast24h,
      activeAlerts,
      criticalAlerts,
      totalUsers,
      blockedIps,
      totalThreatScores,
      averageThreatScore: avgThreatScore._avg.score || 0,
    };
  }

  /**
   * Get threat trends over the past 30 days (daily aggregation).
   *
   * @returns Array of { date, count } objects for the last 30 days
   */
  async getThreatTrends() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const trends = await this.securityLogModel
      .aggregate([
        { $match: { timestamp: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
              },
              severity: '$severity',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.date': 1 } },
      ])
      .exec();

    // Reshape into a more usable format
    const trendMap: Record<
      string,
      { date: string; LOW: number; MEDIUM: number; HIGH: number; CRITICAL: number; total: number }
    > = {};

    for (const item of trends) {
      const date = item._id.date as string;
      const severity = item._id.severity as string;
      if (!trendMap[date]) {
        trendMap[date] = { date, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0, total: 0 };
      }
      trendMap[date][severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'] = item.count;
      trendMap[date].total += item.count;
    }

    return Object.values(trendMap);
  }

  /**
   * Get attack frequency by event type.
   *
   * @returns Array of { eventType, count } sorted by count desc
   */
  async getAttackFrequency() {
    const frequency = await this.securityLogModel
      .aggregate([
        {
          $match: {
            action: { $in: ['DENY', 'DROP', 'ALERT'] },
          },
        },
        {
          $group: {
            _id: '$eventType',
            count: { $sum: 1 },
            avgThreatScore: { $avg: '$threatScore' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ])
      .exec();

    return frequency.map((f) => ({
      eventType: f._id,
      count: f.count,
      avgThreatScore: Math.round((f.avgThreatScore || 0) * 100) / 100,
    }));
  }

  /**
   * Get the distribution of logs by severity level.
   *
   * @returns Array of { severity, count, percentage }
   */
  async getSeverityDistribution() {
    const [distribution, total] = await Promise.all([
      this.securityLogModel
        .aggregate([
          { $group: { _id: '$severity', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .exec(),
      this.securityLogModel.countDocuments().exec(),
    ]);

    return distribution.map((d) => ({
      severity: d._id,
      count: d.count,
      percentage:
        total > 0 ? Math.round((d.count / total) * 10000) / 100 : 0,
    }));
  }

  /**
   * Get recent activity — latest logs and alerts combined.
   *
   * @returns Object with recent logs and recent alerts
   */
  async getRecentActivity() {
    const [recentLogs, recentAlerts] = await Promise.all([
      this.securityLogModel
        .find()
        .sort({ timestamp: -1 })
        .limit(20)
        .lean()
        .exec(),
      this.prisma.alert.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    return { recentLogs, recentAlerts };
  }

  /**
   * Get the top threat sources — most active source IPs and countries.
   *
   * @returns Object with top IPs and top countries
   */
  async getTopSources() {
    const [topIps, topCountries] = await Promise.all([
      this.securityLogModel
        .aggregate([
          { $match: { action: { $in: ['DENY', 'DROP', 'ALERT'] } } },
          {
            $group: {
              _id: '$sourceIp',
              count: { $sum: 1 },
              country: { $first: '$country' },
              lastSeen: { $max: '$timestamp' },
              avgThreatScore: { $avg: '$threatScore' },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 20 },
        ])
        .exec(),
      this.securityLogModel
        .aggregate([
          { $match: { country: { $exists: true, $ne: null } } },
          {
            $group: {
              _id: '$country',
              count: { $sum: 1 },
              maliciousCount: {
                $sum: {
                  $cond: [
                    { $in: ['$action', ['DENY', 'DROP', 'ALERT']] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
          { $sort: { maliciousCount: -1 } },
          { $limit: 15 },
        ])
        .exec(),
    ]);

    return {
      topIps: topIps.map((ip) => ({
        sourceIp: ip._id,
        count: ip.count,
        country: ip.country,
        lastSeen: ip.lastSeen,
        avgThreatScore: Math.round((ip.avgThreatScore || 0) * 100) / 100,
      })),
      topCountries: topCountries.map((c) => ({
        country: c._id,
        totalEvents: c.count,
        maliciousEvents: c.maliciousCount,
      })),
    };
  }

  /**
   * Get geographical attack data — attack origins with coordinates,
   * top attacking countries, and summary metrics.
   *
   * @returns Geo-located attack origins, country stats, and summary
   */
  async getGeoAttacks() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const matchGeoFilter = {
      timestamp: { $gte: thirtyDaysAgo },
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null },
    };

    const attackOrigins = await this.securityLogModel.aggregate([
      { $match: matchGeoFilter },
      {
        $group: {
          _id: '$sourceIp',
          latitude: { $first: '$latitude' },
          longitude: { $first: '$longitude' },
          country: { $first: '$country' },
          city: { $first: '$city' },
          eventType: { $first: '$eventType' },
          severity: { $first: '$severity' },
          timestamp: { $max: '$timestamp' },
          threatScore: { $avg: '$threatScore' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 500 },
      {
        $project: {
          _id: 0,
          sourceIp: '$_id',
          latitude: 1,
          longitude: 1,
          country: 1,
          city: 1,
          eventType: 1,
          severity: 1,
          threatScore: { $round: ['$threatScore', 1] },
          timestamp: 1,
          count: 1,
        },
      },
    ]);

    const topCountries = await this.securityLogModel.aggregate([
      { $match: matchGeoFilter },
      {
        $group: {
          _id: '$country',
          attackCount: { $sum: 1 },
          avgThreatScore: { $avg: '$threatScore' },
          latitude: { $first: '$latitude' },
          longitude: { $first: '$longitude' },
        },
      },
      { $sort: { attackCount: -1 } },
      { $limit: 20 },
      {
        $project: {
          _id: 0,
          country: '$_id',
          attackCount: 1,
          avgThreatScore: { $round: ['$avgThreatScore', 1] },
          latitude: 1,
          longitude: 1,
        },
      },
    ]);

    const [totalOriginsResult, criticalRegionalThreats, mostTargetedPortResult] = await Promise.all([
      this.securityLogModel.aggregate([
        { $match: matchGeoFilter },
        { $group: { _id: '$sourceIp' } },
        { $count: 'totalOrigins' },
      ]),
      this.securityLogModel.countDocuments({
        ...matchGeoFilter,
        severity: 'CRITICAL',
      }),
      this.securityLogModel.aggregate([
        { $match: { timestamp: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: '$destinationPort',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
    ]);

    const totalOrigins =
      totalOriginsResult.length > 0 ? totalOriginsResult[0].totalOrigins : 0;
    const topMaliciousCountry =
      topCountries.length > 0 ? topCountries[0].country : 'N/A';
    const mostTargetedPort =
      mostTargetedPortResult.length > 0 ? mostTargetedPortResult[0]._id : null;

    return {
      attackOrigins,
      topCountries,
      summary: {
        totalOrigins,
        topMaliciousCountry,
        criticalRegionalThreats,
        mostTargetedPort,
      },
    };
  }
}

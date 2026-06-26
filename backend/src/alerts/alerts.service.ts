import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { QueryAlertsDto } from './dto/query-alerts.dto.js';
import { UpdateAlertDto } from './dto/update-alert.dto.js';
import { Prisma } from '@prisma/client';

/**
 * Service for managing security alerts stored in PostgreSQL.
 */
@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Query alerts with filtering, pagination, and sorting.
   *
   * @param query - Query parameters
   * @returns Paginated list of alerts
   */
  async findAll(query: QueryAlertsDto) {
    const {
      page = 1,
      limit = 20,
      type,
      severity,
      status,
      startDate,
      endDate,
      search,
    } = query;

    const where: Prisma.AlertWhereInput = {};

    if (type) where.type = type as Prisma.EnumAlertTypeFilter['equals'];
    if (severity) where.severity = severity as Prisma.EnumSeverityFilter['equals'];
    if (status) where.status = status as Prisma.EnumAlertStatusFilter['equals'];

    // Date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sourceIp: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [alerts, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.alert.count({ where }),
    ]);

    return {
      alerts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieve a single alert by ID.
   *
   * @param id - Alert UUID
   * @returns Alert with assigned user details
   * @throws NotFoundException if alert does not exist
   */
  async findOne(id: string) {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException(`Alert with ID "${id}" not found`);
    }

    return alert;
  }

  /**
   * Update an alert (status change, assignment, etc.).
   *
   * @param id - Alert UUID
   * @param dto - Fields to update
   * @returns Updated alert
   * @throws NotFoundException if alert does not exist
   */
  async update(id: string, dto: UpdateAlertDto) {
    await this.findOne(id);

    const data: Prisma.AlertUpdateInput = {};

    if (dto.status) {
      data.status = dto.status as Prisma.EnumAlertStatusFieldUpdateOperationsInput['set'];
      // Auto-set resolvedAt when marking as resolved
      if (dto.status === 'RESOLVED' || dto.status === 'FALSE_POSITIVE') {
        data.resolvedAt = new Date();
      }
    }

    if (dto.assignedToId !== undefined) {
      data.assignedTo = dto.assignedToId
        ? { connect: { id: dto.assignedToId } }
        : { disconnect: true };
    }

    if (dto.title) data.title = dto.title;
    if (dto.description) data.description = dto.description;

    const alert = await this.prisma.alert.update({
      where: { id },
      data,
      include: {
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    this.logger.log(`Alert updated: ${id} — status: ${alert.status}`);
    return alert;
  }

  /**
   * Get aggregated alert statistics.
   *
   * @returns Statistics including counts by severity, status, type, and trends
   */
  async getStats() {
    const [
      total,
      bySeverity,
      byStatus,
      byType,
      recentAlerts,
      avgThreatScore,
    ] = await Promise.all([
      this.prisma.alert.count(),

      this.prisma.alert.groupBy({
        by: ['severity'],
        _count: { severity: true },
      }),

      this.prisma.alert.groupBy({
        by: ['status'],
        _count: { status: true },
      }),

      this.prisma.alert.groupBy({
        by: ['type'],
        _count: { type: true },
        orderBy: { _count: { type: 'desc' } },
      }),

      // Last 10 alerts
      this.prisma.alert.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          severity: true,
          status: true,
          title: true,
          sourceIp: true,
          threatScore: true,
          createdAt: true,
        },
      }),

      this.prisma.alert.aggregate({
        _avg: { threatScore: true },
      }),
    ]);

    return {
      total,
      bySeverity: bySeverity.map((s) => ({
        severity: s.severity,
        count: s._count.severity,
      })),
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
      byType: byType.map((t) => ({
        type: t.type,
        count: t._count.type,
      })),
      recentAlerts,
      averageThreatScore: avgThreatScore._avg.threatScore || 0,
    };
  }
}

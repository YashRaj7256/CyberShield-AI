import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Model, SortOrder } from 'mongoose';
import { Queue } from 'bullmq';
import {
  SecurityLog,
  SecurityLogDocument,
} from './schemas/security-log.schema.js';
import { QueryLogsDto } from './dto/query-logs.dto.js';
import { CreateLogDto } from './dto/create-log.dto.js';

/**
 * Service for managing security log entries stored in MongoDB.
 * Supports CRUD, search, filtering, pagination, and aggregations.
 */
@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  constructor(
    @InjectModel(SecurityLog.name)
    private readonly securityLogModel: Model<SecurityLogDocument>,
    @InjectQueue('log-processing')
    private readonly logQueue: Queue,
  ) {}

  /**
   * Query security logs with filtering, pagination, and sorting.
   *
   * @param query - Query parameters (filters, pagination, sorting)
   * @returns Paginated list of security logs and metadata
   */
  async findAll(query: QueryLogsDto) {
    const {
      page = 1,
      limit = 50,
      search,
      severity,
      source,
      startDate,
      endDate,
      sourceIp,
      country,
      sortBy = 'timestamp',
      sortOrder = 'desc',
    } = query;

    const filter: Record<string, unknown> = {};

    // Text search across message and eventType
    if (search) {
      filter.$or = [
        { message: { $regex: search, $options: 'i' } },
        { eventType: { $regex: search, $options: 'i' } },
        { sourceIp: { $regex: search, $options: 'i' } },
      ];
    }

    if (severity) filter.severity = severity;
    if (source) filter.source = source;
    if (sourceIp) filter.sourceIp = sourceIp;
    if (country) filter.country = { $regex: country, $options: 'i' };

    // Date range filter
    if (startDate || endDate) {
      const tsFilter: Record<string, Date> = {};
      if (startDate) tsFilter.$gte = new Date(startDate);
      if (endDate) tsFilter.$lte = new Date(endDate);
      filter.timestamp = tsFilter;
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, SortOrder> = {
      [sortBy]: sortOrder as SortOrder,
    };

    const [logs, total] = await Promise.all([
      this.securityLogModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.securityLogModel.countDocuments(filter).exec(),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieve a single log entry by its MongoDB ObjectId.
   *
   * @param id - MongoDB ObjectId string
   * @returns The security log document
   * @throws NotFoundException if log does not exist
   */
  async findOne(id: string) {
    const log = await this.securityLogModel.findById(id).lean().exec();
    if (!log) {
      throw new NotFoundException(`Log with ID "${id}" not found`);
    }
    return log;
  }

  /**
   * Ingest a single security log entry.
   *
   * @param dto - Log data to create
   * @returns The created log document
   */
  async create(dto: CreateLogDto) {
    const log = new this.securityLogModel({
      ...dto,
      timestamp: new Date(dto.timestamp),
    });
    const saved = await log.save();
    this.logger.log(`Log ingested: ${saved._id}`);
    await this.logQueue.add('process-log', { logId: saved._id.toString() });
    return saved.toObject();
  }

  /**
   * Ingest multiple security log entries in bulk.
   *
   * @param logs - Array of log data to create
   * @returns Count of inserted documents
   */
  async createBulk(logs: CreateLogDto[]) {
    const documents = logs.map((dto) => ({
      ...dto,
      timestamp: new Date(dto.timestamp),
    }));

    const result = await this.securityLogModel.insertMany(documents, {
      ordered: false,
    });

    for (const doc of result) {
      await this.logQueue.add('process-log', { logId: doc._id.toString() });
    }

    this.logger.log(`Bulk ingested ${result.length} logs`);
    return { inserted: result.length };
  }

  /**
   * Get aggregated statistics about security logs.
   *
   * @returns Statistics including counts by severity, source, action, and top IPs
   */
  async getStats() {
    const [
      totalLogs,
      severityCounts,
      sourceCounts,
      actionCounts,
      topSourceIps,
      recentActivity,
      countryCounts,
    ] = await Promise.all([
      // Total count
      this.securityLogModel.countDocuments().exec(),

      // Count by severity
      this.securityLogModel
        .aggregate([
          { $group: { _id: '$severity', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .exec(),

      // Count by source
      this.securityLogModel
        .aggregate([
          { $group: { _id: '$source', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .exec(),

      // Count by action
      this.securityLogModel
        .aggregate([
          { $group: { _id: '$action', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .exec(),

      // Top 10 source IPs
      this.securityLogModel
        .aggregate([
          { $group: { _id: '$sourceIp', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ])
        .exec(),

      // Logs per hour (last 24 hours)
      this.securityLogModel
        .aggregate([
          {
            $match: {
              timestamp: {
                $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d %H:00',
                  date: '$timestamp',
                },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .exec(),

      // Count by country
      this.securityLogModel
        .aggregate([
          { $match: { country: { $exists: true, $ne: null } } },
          { $group: { _id: '$country', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 15 },
        ])
        .exec(),
    ]);

    return {
      totalLogs,
      severityCounts,
      sourceCounts,
      actionCounts,
      topSourceIps,
      recentActivity,
      countryCounts,
    };
  }
}

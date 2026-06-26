import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LogsService } from './logs.service.js';
import { QueryLogsDto } from './dto/query-logs.dto.js';
import { CreateLogDto } from './dto/create-log.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

/**
 * Handles security log endpoints: querying, ingestion, and statistics.
 */
@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  /**
   * Query security logs with filtering, pagination, and sorting.
   *
   * @param query - Query parameters
   * @returns Paginated security logs
   */
  @Get()
  async findAll(@Query() query: QueryLogsDto) {
    return this.logsService.findAll(query);
  }

  /**
   * Get aggregated log statistics.
   *
   * @returns Statistics object with counts by severity, source, etc.
   */
  @Get('stats')
  async getStats() {
    return this.logsService.getStats();
  }

  /**
   * Get a single log entry by ID.
   *
   * @param id - MongoDB ObjectId
   * @returns The log entry
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.logsService.findOne(id);
  }

  /**
   * Ingest a single security log entry.
   *
   * @param dto - Log data
   * @returns The created log
   */
  @Post()
  @Roles('ADMIN', 'ANALYST')
  async create(@Body() dto: CreateLogDto) {
    return this.logsService.create(dto);
  }

  /**
   * Ingest multiple security log entries in bulk.
   *
   * @param logs - Array of log data
   * @returns Count of inserted documents
   */
  @Post('bulk')
  @Roles('ADMIN', 'ANALYST')
  async createBulk(@Body() logs: CreateLogDto[]) {
    return this.logsService.createBulk(logs);
  }
}

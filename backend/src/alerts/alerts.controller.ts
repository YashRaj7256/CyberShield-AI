import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AlertsService } from './alerts.service.js';
import { QueryAlertsDto } from './dto/query-alerts.dto.js';
import { UpdateAlertDto } from './dto/update-alert.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

/**
 * Handles alert management endpoints: querying, updating, and statistics.
 */
@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  /**
   * Query alerts with filtering, pagination, and sorting.
   *
   * @param query - Query parameters
   * @returns Paginated list of alerts
   */
  @Get()
  async findAll(@Query() query: QueryAlertsDto) {
    return this.alertsService.findAll(query);
  }

  /**
   * Get aggregated alert statistics.
   *
   * @returns Alert statistics
   */
  @Get('stats')
  async getStats() {
    return this.alertsService.getStats();
  }

  /**
   * Get a single alert by ID.
   *
   * @param id - Alert UUID
   * @returns The alert
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }

  /**
   * Update an alert (status, assignment, etc.).
   * Restricted to ADMIN and ANALYST roles.
   *
   * @param id - Alert UUID
   * @param dto - Fields to update
   * @returns Updated alert
   */
  @Patch(':id')
  @Roles('ADMIN', 'ANALYST')
  async update(@Param('id') id: string, @Body() dto: UpdateAlertDto) {
    return this.alertsService.update(id, dto);
  }
}

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service.js';
import type { ReportUserContext } from './reports.service.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { QueryReportsDto } from './dto/query-reports.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

/**
 * Controller managing threat intelligence reports generation, queries,
 * previewing, and PDF/CSV downloads.
 */
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Generate and persist a new report (PDF or CSV) with full cross-telemetry analysis.
   */
  @Post('generate')
  @Roles('ADMIN', 'ANALYST')
  @HttpCode(HttpStatus.CREATED)
  async generate(
    @Body() dto: CreateReportDto,
    @CurrentUser() user: ReportUserContext,
  ) {
    return this.reportsService.generateReport(dto, user);
  }

  /**
   * On-the-fly preview of report metrics and executive insights without saving.
   */
  @Post('preview')
  @Roles('ADMIN', 'ANALYST', 'VIEWER')
  @HttpCode(HttpStatus.OK)
  async preview(
    @Body() dto: CreateReportDto,
    @CurrentUser() user: ReportUserContext,
  ) {
    return this.reportsService.previewReport(dto, user);
  }

  /**
   * Get metadata and overview stats across all reports.
   */
  @Get('stats')
  @Roles('ADMIN', 'ANALYST', 'VIEWER')
  async getStats() {
    return this.reportsService.getReportStats();
  }

  /**
   * List generated reports with pagination and filtering.
   */
  @Get()
  @Roles('ADMIN', 'ANALYST', 'VIEWER')
  async findAll(@Query() query: QueryReportsDto) {
    return this.reportsService.findAll(query);
  }

  /**
   * Retrieve a single report with its complete executive summary data.
   */
  @Get(':id')
  @Roles('ADMIN', 'ANALYST', 'VIEWER')
  async findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  /**
   * Download the generated report file directly (PDF or CSV).
   */
  @Get(':id/download')
  @Roles('ADMIN', 'ANALYST', 'VIEWER')
  async download(@Param('id') id: string, @Res() res: Response) {
    const { filename, mimeType, fileStream } =
      await this.reportsService.getDownloadStream(id);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    fileStream.pipe(res);
  }

  /**
   * Delete a report by ID (restricted to ADMIN and ANALYST).
   */
  @Delete(':id')
  @Roles('ADMIN', 'ANALYST')
  async remove(@Param('id') id: string) {
    return this.reportsService.remove(id);
  }
}

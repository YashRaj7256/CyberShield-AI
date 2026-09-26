import { IsEnum, IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';
import { ReportType, ReportFormat } from '@prisma/client';

/**
 * Data transfer object for requesting a new threat intelligence report generation.
 */
export class CreateReportDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType = ReportType.WEEKLY;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat = ReportFormat.PDF;

  @IsOptional()
  @IsDateString()
  dateRangeStart?: string;

  @IsOptional()
  @IsDateString()
  dateRangeEnd?: string;

  @IsOptional()
  @IsBoolean()
  includeLogs?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeAlerts?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeThreatScores?: boolean = true;
}

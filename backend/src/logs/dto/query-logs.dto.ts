import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Allowed sort orders.
 */
enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * DTO for querying security logs with filtering, pagination, and sorting.
 */
export class QueryLogsDto {
  /** Page number (1-indexed) */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  /** Number of items per page */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 50;

  /** Full-text search across message and eventType */
  @IsOptional()
  @IsString()
  search?: string;

  /** Filter by severity level */
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    message: 'Severity must be LOW, MEDIUM, HIGH, or CRITICAL',
  })
  severity?: string;

  /** Filter by log source */
  @IsOptional()
  @IsEnum(
    ['FIREWALL', 'IDS', 'ANTIVIRUS', 'SERVER', 'APPLICATION', 'CLOUD', 'NETWORK', 'MANUAL'],
    { message: 'Invalid source value' },
  )
  source?: string;

  /** Filter logs from this date onward (ISO 8601) */
  @IsOptional()
  @IsDateString()
  startDate?: string;

  /** Filter logs up to this date (ISO 8601) */
  @IsOptional()
  @IsDateString()
  endDate?: string;

  /** Filter by source IP address */
  @IsOptional()
  @IsString()
  sourceIp?: string;

  /** Filter by country of origin */
  @IsOptional()
  @IsString()
  country?: string;

  /** Field to sort by */
  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp';

  /** Sort order */
  @IsOptional()
  @IsEnum(SortOrder, { message: 'Sort order must be asc or desc' })
  sortOrder?: SortOrder = SortOrder.DESC;
}

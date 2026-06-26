import { IsOptional, IsString, IsEnum, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for querying alerts with filtering, pagination, and sorting.
 */
export class QueryAlertsDto {
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
  @Max(100)
  limit?: number = 20;

  /** Filter by alert type */
  @IsOptional()
  @IsEnum(
    [
      'BRUTE_FORCE',
      'SUSPICIOUS_LOGIN',
      'PORT_SCAN',
      'DDOS',
      'MALWARE',
      'CREDENTIAL_STUFFING',
      'INSIDER_THREAT',
      'UNAUTHORIZED_ACCESS',
    ],
    { message: 'Invalid alert type' },
  )
  type?: string;

  /** Filter by severity */
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    message: 'Severity must be LOW, MEDIUM, HIGH, or CRITICAL',
  })
  severity?: string;

  /** Filter by status */
  @IsOptional()
  @IsEnum(['NEW', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE'], {
    message: 'Invalid status value',
  })
  status?: string;

  /** Filter alerts from this date onward (ISO 8601) */
  @IsOptional()
  @IsDateString()
  startDate?: string;

  /** Filter alerts up to this date (ISO 8601) */
  @IsOptional()
  @IsDateString()
  endDate?: string;

  /** Search in title and description */
  @IsOptional()
  @IsString()
  search?: string;
}

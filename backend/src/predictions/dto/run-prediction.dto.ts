import { IsOptional, IsInt, Min, Max, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for running an attack prediction analysis.
 */
export class RunPredictionDto {
  /**
   * Analysis window size in hours (default: 24, max: 168 = 7 days).
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(168)
  windowHours?: number = 24;

  /**
   * Whether to fetch recent security telemetry from MongoDB (default: true).
   */
  @IsOptional()
  @IsBoolean()
  useDatabaseLogs?: boolean = true;

  /**
   * Optional custom log entries to analyse instead of / in addition to DB logs.
   */
  @IsOptional()
  @IsArray()
  logs?: Record<string, unknown>[];
}

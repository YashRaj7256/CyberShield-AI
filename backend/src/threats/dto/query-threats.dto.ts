import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for querying threat entities with filtering, pagination, and sorting.
 */
export class QueryThreatsDto {
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
  @Max(200)
  limit?: number = 100;

  /** Filter by category */
  @IsOptional()
  @IsEnum(['SAFE', 'LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK', 'CRITICAL'], {
    message: 'Category must be SAFE, LOW_RISK, MEDIUM_RISK, HIGH_RISK, or CRITICAL',
  })
  category?: string;

  /** Filter by entity type */
  @IsOptional()
  @IsEnum(['IP', 'USER', 'SESSION'], {
    message: 'EntityType must be IP, USER, or SESSION',
  })
  entityType?: string;

  /** Search across entityValue or modelUsed */
  @IsOptional()
  @IsString()
  search?: string;
}

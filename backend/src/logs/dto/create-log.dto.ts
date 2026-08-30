import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsObject,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating / ingesting a single security log entry.
 */
export class CreateLogDto {
  /** Event timestamp (ISO 8601) */
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  /** Source IP address */
  @IsString()
  @IsNotEmpty()
  sourceIp!: string;

  /** Destination IP address */
  @IsString()
  @IsNotEmpty()
  destinationIp!: string;

  /** Source port number */
  @IsOptional()
  @IsNumber()
  sourcePort?: number;

  /** Destination port number */
  @IsOptional()
  @IsNumber()
  destinationPort?: number;

  /** Network protocol (TCP, UDP, HTTP, etc.) */
  @IsString()
  @IsNotEmpty()
  protocol!: string;

  /** Action taken (ALLOW, DENY, DROP, ALERT) */
  @IsEnum(['ALLOW', 'DENY', 'DROP', 'ALERT'])
  action!: string;

  /** Severity level */
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity!: string;

  /** Log source system */
  @IsEnum(['FIREWALL', 'IDS', 'ANTIVIRUS', 'SERVER', 'APPLICATION', 'CLOUD', 'NETWORK', 'MANUAL'])
  source!: string;

  /** Event type identifier */
  @IsString()
  @IsNotEmpty()
  eventType!: string;

  /** Human-readable event description */
  @IsString()
  @IsNotEmpty()
  message!: string;

  /** Country of origin */
  @IsOptional()
  @IsString()
  country?: string;

  /** City of origin */
  @IsOptional()
  @IsString()
  city?: string;

  /** Latitude coordinate */
  @IsOptional()
  @IsNumber()
  latitude?: number;

  /** Longitude coordinate */
  @IsOptional()
  @IsNumber()
  longitude?: number;

  /** Associated user ID */
  @IsOptional()
  @IsString()
  userId?: string;

  /** Associated user name */
  @IsOptional()
  @IsString()
  userName?: string;

  /** Device type */
  @IsOptional()
  @IsString()
  deviceType?: string;

  /** Browser name */
  @IsOptional()
  @IsString()
  browser?: string;

  /** Operating system */
  @IsOptional()
  @IsString()
  os?: string;

  /** Raw event data */
  @IsOptional()
  @IsObject()
  rawData?: Record<string, unknown>;

  /** Whether the log has been processed */
  @IsOptional()
  @IsBoolean()
  isProcessed?: boolean;

  /** Anomaly score (0-100) */
  @IsOptional()
  @IsNumber()
  anomalyScore?: number;

  /** Threat score (0-100) */
  @IsOptional()
  @IsNumber()
  threatScore?: number;

  /** Additional metadata */
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

/**
 * DTO for bulk log ingestion.
 */
export class BulkCreateLogsDto {
  /** Array of security log entries */
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateLogDto)
  logs!: CreateLogDto[];
}


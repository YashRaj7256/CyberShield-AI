import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

/**
 * Allowed values for the log action field.
 */
export enum LogAction {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
  DROP = 'DROP',
  ALERT = 'ALERT',
}

/**
 * Allowed values for the log severity field.
 */
export enum LogSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Allowed values for the log source field.
 */
export enum LogSource {
  FIREWALL = 'FIREWALL',
  IDS = 'IDS',
  ANTIVIRUS = 'ANTIVIRUS',
  SERVER = 'SERVER',
  APPLICATION = 'APPLICATION',
  CLOUD = 'CLOUD',
  NETWORK = 'NETWORK',
  MANUAL = 'MANUAL',
}

export type SecurityLogDocument = HydratedDocument<SecurityLog>;

/**
 * MongoDB schema for raw security log events ingested from
 * various sources (firewall, IDS, antivirus, etc.).
 */
@Schema({
  timestamps: true,
  collection: 'security_logs',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class SecurityLog {
  @Prop({ type: Date, required: true, index: true })
  timestamp!: Date;

  @Prop({ type: String, required: true, index: true })
  sourceIp!: string;

  @Prop({ type: String, required: true })
  destinationIp!: string;

  @Prop({ type: Number, required: true })
  sourcePort!: number;

  @Prop({ type: Number, required: true })
  destinationPort!: number;

  @Prop({ type: String, required: true })
  protocol!: string;

  @Prop({ type: String, enum: Object.values(LogAction), required: true })
  action!: string;

  @Prop({ type: String, enum: Object.values(LogSeverity), required: true, index: true })
  severity!: string;

  @Prop({ type: String, enum: Object.values(LogSource), required: true })
  source!: string;

  @Prop({ type: String, required: true })
  eventType!: string;

  @Prop({ type: String, required: true })
  message!: string;

  @Prop({ type: String })
  country?: string;

  @Prop({ type: String })
  city?: string;

  @Prop({ type: Number })
  latitude?: number;

  @Prop({ type: Number })
  longitude?: number;

  @Prop({ type: String })
  userId?: string;

  @Prop({ type: String })
  userName?: string;

  @Prop({ type: String })
  deviceType?: string;

  @Prop({ type: String })
  browser?: string;

  @Prop({ type: String })
  os?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  rawData?: Record<string, unknown>;

  @Prop({ type: Boolean, default: false, index: true })
  isProcessed!: boolean;

  @Prop({ type: Number })
  anomalyScore?: number;

  @Prop({ type: Number })
  threatScore?: number;

  @Prop({ type: Date })
  processedAt?: Date;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, unknown>;
}

export const SecurityLogSchema = SchemaFactory.createForClass(SecurityLog);

// Compound indexes for common query patterns
SecurityLogSchema.index({ sourceIp: 1, timestamp: -1 });
SecurityLogSchema.index({ severity: 1, timestamp: -1 });
SecurityLogSchema.index({ isProcessed: 1, timestamp: -1 });
SecurityLogSchema.index({ eventType: 1, timestamp: -1 });
SecurityLogSchema.index({ source: 1, timestamp: -1 });

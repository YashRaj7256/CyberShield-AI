import { IsOptional, IsBoolean, IsEnum } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  emailAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  dashboardAlerts?: boolean;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severityThreshold?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

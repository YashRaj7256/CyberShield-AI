import { IsOptional, IsString, IsEnum } from 'class-validator';

/**
 * DTO for updating an alert (status change, assignment, etc.).
 */
export class UpdateAlertDto {
  /** New alert status */
  @IsOptional()
  @IsEnum(['NEW', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE'], {
    message: 'Status must be NEW, INVESTIGATING, RESOLVED, or FALSE_POSITIVE',
  })
  status?: string;

  /** ID of the user to assign this alert to */
  @IsOptional()
  @IsString()
  assignedToId?: string;

  /** Updated title */
  @IsOptional()
  @IsString()
  title?: string;

  /** Updated description */
  @IsOptional()
  @IsString()
  description?: string;
}

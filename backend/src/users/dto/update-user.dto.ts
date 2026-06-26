import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';

/**
 * Allowed role values for updates.
 */
enum Role {
  ADMIN = 'ADMIN',
  ANALYST = 'ANALYST',
  VIEWER = 'VIEWER',
}

/**
 * DTO for updating an existing user.
 * All fields are optional — only provided fields are updated.
 */
export class UpdateUserDto {
  /** Updated first name */
  @IsOptional()
  @IsString()
  firstName?: string;

  /** Updated last name */
  @IsOptional()
  @IsString()
  lastName?: string;

  /** Updated role — admin only */
  @IsOptional()
  @IsEnum(Role, { message: 'Role must be ADMIN, ANALYST, or VIEWER' })
  role?: Role;

  /** Whether the user account is active */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /** Whether the user account is verified */
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

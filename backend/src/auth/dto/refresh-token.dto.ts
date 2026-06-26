import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for refreshing an access token using a refresh token.
 */
export class RefreshTokenDto {
  /** The refresh token issued during login */
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken!: string;
}

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for user login.
 */
export class LoginDto {
  /** User email address */
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  /** User password */
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}

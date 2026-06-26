import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO for new user registration.
 */
export class RegisterDto {
  /** User email address — must be a valid email format */
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  /** Password — minimum 8 characters */
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;

  /** User first name */
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName!: string;

  /** User last name */
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName!: string;
}

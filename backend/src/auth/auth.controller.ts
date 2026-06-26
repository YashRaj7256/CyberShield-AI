import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

/**
 * Handles authentication endpoints: register, login, refresh, logout, and profile.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user account.
   *
   * @param dto - Registration data
   * @returns Created user and JWT tokens
   */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Authenticate a user with email and password.
   * Uses Passport local strategy for credential validation.
   *
   * @param req - Express request (user attached by LocalStrategy)
   * @returns User profile and JWT tokens
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  async login(@Req() req: Request) {
    const user = req.user as {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isActive: boolean;
      isVerified: boolean;
    };
    return this.authService.login(user, req.ip);
  }

  /**
   * Refresh access token using a valid refresh token.
   *
   * @param dto - Contains the refresh token
   * @returns New access and refresh tokens
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  /**
   * Log out the current user.
   *
   * @param user - Current authenticated user
   * @returns Logout confirmation message
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  /**
   * Get the current authenticated user's profile.
   *
   * @param user - Current authenticated user
   * @returns User profile data
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }
}

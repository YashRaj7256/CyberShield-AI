import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';

/**
 * Shape of the JWT token payload.
 */
interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

/**
 * Shape of the authenticated user returned to the client.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
}

/**
 * Handles all authentication operations: registration, login,
 * token generation/refresh, and logout.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user account.
   *
   * @param dto - Registration data (email, password, firstName, lastName)
   * @returns The created user (without password) and JWT tokens
   * @throws ConflictException if the email is already registered
   */
  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    // Hash password with 12 rounds of bcrypt
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        isVerified: true, // Auto-verify for now
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true,
      },
    });

    this.logger.log(`New user registered: ${user.email}`);

    const tokens = await this.generateTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Validate user credentials for login.
   *
   * @param email - User email
   * @param password - Plain-text password
   * @returns The user object (without password) if valid, null otherwise
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
    };
  }

  /**
   * Log in a validated user — generates JWT access and refresh tokens.
   *
   * @param user - The authenticated user object
   * @param ip - Client IP address for audit tracking
   * @returns The user object and JWT tokens
   */
  async login(user: AuthenticatedUser, ip?: string) {
    // Update last login metadata
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ip || null,
      },
    });

    const tokens = await this.generateTokens(user);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Refresh an access token using a valid refresh token.
   *
   * @param refreshToken - The refresh token to validate
   * @returns New access and refresh tokens
   * @throws UnauthorizedException if the refresh token is invalid or expired
   */
  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          isVerified: true,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or account is disabled');
      }

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Log out a user. In a stateless JWT setup this is a no-op on the server,
   * but we log the action for audit purposes.
   *
   * @param userId - ID of the user logging out
   */
  async logout(userId: string) {
    this.logger.log(`User logged out: ${userId}`);
    return { message: 'Successfully logged out' };
  }

  /**
   * Retrieve the currently authenticated user's profile.
   *
   * @param userId - ID of the current user
   * @returns User profile without password
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Generate a pair of JWT access and refresh tokens for the given user.
   *
   * @param user - User to create tokens for
   * @returns Object with accessToken and refreshToken strings
   */
  private async generateTokens(user: AuthenticatedUser) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload as Record<string, unknown>, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: 900, // 15 minutes
      }),
      this.jwtService.signAsync(payload as Record<string, unknown>, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: 604800, // 7 days
      }),
    ]);

    return { accessToken, refreshToken };
  }
}

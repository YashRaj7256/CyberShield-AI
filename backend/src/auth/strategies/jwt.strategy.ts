import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';

/**
 * JWT payload structure after decoding.
 */
interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

/**
 * Passport strategy that validates JWT access tokens.
 * Extracts the token from the Authorization Bearer header,
 * verifies it, then loads the full user record from the database.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_SECRET') || 'fallback-secret';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Called after JWT verification. Loads the user from the database
   * and attaches it to the request object.
   *
   * @param payload - Decoded JWT payload
   * @returns The user object (without password) attached to request.user
   * @throws UnauthorizedException if the user does not exist or is inactive
   */
  async validate(payload: JwtPayload) {
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

    return user;
  }
}

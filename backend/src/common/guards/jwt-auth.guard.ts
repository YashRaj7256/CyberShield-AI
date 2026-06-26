import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that enforces JWT-based authentication on protected routes.
 * Delegates token extraction and validation to the 'jwt' Passport strategy.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

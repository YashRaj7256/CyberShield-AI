import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

/**
 * Guard that enforces Role-Based Access Control (RBAC).
 * Checks whether the authenticated user possesses at least one
 * of the roles specified by the @Roles() decorator.
 *
 * If no roles are specified on the handler, access is granted by default.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Determines whether the current request is authorised based on user roles.
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No roles required — allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: string } | undefined;

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: no role assigned');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: requires one of [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}

import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used by the RolesGuard to retrieve the required roles.
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator that attaches required roles to a route handler.
 * Used in conjunction with RolesGuard to enforce RBAC.
 *
 * @example
 * ```ts
 * @Roles('ADMIN', 'ANALYST')
 * @Get('sensitive-data')
 * getSensitiveData() { ... }
 * ```
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

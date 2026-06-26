import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Parameter decorator that extracts the current authenticated user
 * (or a specific property of the user) from the request object.
 *
 * @example
 * ```ts
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) { ... }
 *
 * @Get('email')
 * getEmail(@CurrentUser('email') email: string) { ... }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return null;
    if (data) {
      return (user as Record<string, unknown>)[data];
    }
    return user;
  },
);

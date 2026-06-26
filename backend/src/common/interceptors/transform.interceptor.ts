import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Shape of the standardised API response envelope.
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

/**
 * Global interceptor that wraps all successful responses in a
 * consistent envelope: `{ success: true, data: ..., timestamp: ... }`.
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  /**
   * Intercepts the outgoing response and wraps it.
   */
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true as const,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';

/**
 * Bootstrap the NestJS application with all global middleware,
 * pipes, filters, and interceptors configured.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // ─── Body Parser Limits (Allow large bulk log ingestion) ──────
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // ─── CORS ───────────────────────────────────────────────────────
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ─── Global Prefix ─────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ─── Global Validation Pipe ────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── Global Exception Filter ──────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ─── Global Response Transform Interceptor ────────────────────
  app.useGlobalInterceptors(new TransformInterceptor());

  // ─── Start Server ─────────────────────────────────────────────
  const port = process.env['PORT'] || 3001;
  await app.listen(port);

  logger.log(`🚀 CTI Backend running on http://localhost:${port}/api`);
  logger.log(`📊 Environment: ${process.env['NODE_ENV'] || 'development'}`);
}

bootstrap();

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { LogsModule } from './logs/logs.module.js';
import { AlertsModule } from './alerts/alerts.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { JobsModule } from './jobs/jobs.module.js';

/**
 * Root application module — imports and configures all feature modules,
 * database connections, and infrastructure services.
 */
@Module({
  imports: [
    // ─── Global Configuration ───────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),

    // ─── MongoDB (raw security logs) ────────────────────────────────
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // ─── BullMQ (background job queues via Redis) ───────────────────
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),

    // ─── Database (PostgreSQL via Prisma) ───────────────────────────
    PrismaModule,

    // ─── Feature Modules ────────────────────────────────────────────
    AuthModule,
    UsersModule,
    LogsModule,
    AlertsModule,
    DashboardModule,
    JobsModule,
  ],
})
export class AppModule {}

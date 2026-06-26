import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service.js';
import { DashboardController } from './dashboard.controller.js';
import {
  SecurityLog,
  SecurityLogSchema,
} from '../logs/schemas/security-log.schema.js';

/**
 * Module for dashboard analytics and aggregation endpoints.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SecurityLog.name, schema: SecurityLogSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

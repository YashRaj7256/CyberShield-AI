import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';
import {
  SecurityLog,
  SecurityLogSchema,
} from '../logs/schemas/security-log.schema.js';

/**
 * Module responsible for automated cybersecurity threat reports generation,
 * metric aggregation, PDF/CSV generation, and executive previews.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SecurityLog.name, schema: SecurityLogSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}

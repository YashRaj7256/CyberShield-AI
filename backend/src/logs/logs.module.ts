import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { LogsService } from './logs.service.js';
import { LogsController } from './logs.controller.js';
import {
  SecurityLog,
  SecurityLogSchema,
} from './schemas/security-log.schema.js';

/**
 * Module for security log management — ingestion, querying, and analysis.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SecurityLog.name, schema: SecurityLogSchema },
    ]),
    BullModule.registerQueue({ name: 'log-processing' }),
  ],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}


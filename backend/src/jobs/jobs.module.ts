import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { LogsProcessor } from './logs.processor.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { MongooseModule } from '@nestjs/mongoose';
import { SecurityLog, SecurityLogSchema } from '../logs/schemas/security-log.schema.js';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'log-processing' }),
    PrismaModule,
    MongooseModule.forFeature([
      { name: SecurityLog.name, schema: SecurityLogSchema },
    ]),
  ],
  providers: [LogsProcessor],
  exports: [BullModule],
})
export class JobsModule {}

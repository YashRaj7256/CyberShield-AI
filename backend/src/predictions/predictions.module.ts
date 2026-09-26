import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PredictionsController } from './predictions.controller.js';
import { PredictionsService } from './predictions.service.js';
import {
  SecurityLog,
  SecurityLogSchema,
} from '../logs/schemas/security-log.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SecurityLog.name, schema: SecurityLogSchema },
    ]),
  ],
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}

import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service.js';
import { AlertsController } from './alerts.controller.js';

/**
 * Module for security alert management.
 */
@Module({
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}

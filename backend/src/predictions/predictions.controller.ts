import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PredictionsService } from './predictions.service.js';
import { RunPredictionDto } from './dto/run-prediction.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

/**
 * Controller exposing AI attack prediction and proactive defense forecasting.
 * Requires JWT authentication. Accessible to ADMIN, ANALYST, and VIEWER.
 */
@Controller('predictions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  /**
   * Run attack forecasting analysis over recent telemetry.
   *
   * @param dto - Prediction parameters (window size, optional custom logs)
   * @returns Predictive attack scenarios, probability ratings, timeframes & countermeasures
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN', 'ANALYST', 'VIEWER')
  async predict(@Body() dto: RunPredictionDto) {
    return this.predictionsService.predict(dto);
  }

  /**
   * Quick GET endpoint to run baseline prediction for a given window size (default 24h).
   */
  @Get('forecast')
  @Roles('ADMIN', 'ANALYST', 'VIEWER')
  async getForecast(@Query('windowHours') windowHours?: number) {
    const dto = new RunPredictionDto();
    if (windowHours) {
      dto.windowHours = Number(windowHours);
    }
    return this.predictionsService.predict(dto);
  }
}

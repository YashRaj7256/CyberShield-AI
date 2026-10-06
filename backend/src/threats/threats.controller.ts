import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ThreatsService } from './threats.service.js';
import { QueryThreatsDto } from './dto/query-threats.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

/**
 * Controller exposing threat entities and score analysis endpoints.
 */
@Controller('threats')
@UseGuards(JwtAuthGuard)
export class ThreatsController {
  constructor(private readonly threatsService: ThreatsService) {}

  /**
   * Query threat entities with filtering, pagination, and sorting.
   */
  @Get()
  async findAll(@Query() query: QueryThreatsDto) {
    return this.threatsService.findAll(query);
  }

  /**
   * Get aggregate threat statistics summary.
   */
  @Get('summary')
  async getSummary() {
    return this.threatsService.getSummary();
  }

  /**
   * Retrieve a single threat entity by ID.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.threatsService.findOne(id);
  }
}

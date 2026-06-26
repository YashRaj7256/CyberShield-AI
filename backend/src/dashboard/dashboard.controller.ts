import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

/**
 * Dashboard endpoints providing aggregated analytics and statistics.
 */
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Get high-level platform statistics.
   *
   * @returns Overview stats (total logs, alerts, users, etc.)
   */
  @Get('stats')
  async getStats() {
    return this.dashboardService.getStats();
  }

  /**
   * Get threat trends over the past 30 days.
   *
   * @returns Daily threat counts by severity
   */
  @Get('threat-trends')
  async getThreatTrends() {
    return this.dashboardService.getThreatTrends();
  }

  /**
   * Get attack frequency by event type.
   *
   * @returns Attack types ranked by frequency
   */
  @Get('attack-frequency')
  async getAttackFrequency() {
    return this.dashboardService.getAttackFrequency();
  }

  /**
   * Get severity distribution of all logs.
   *
   * @returns Severity counts and percentages
   */
  @Get('severity-distribution')
  async getSeverityDistribution() {
    return this.dashboardService.getSeverityDistribution();
  }

  /**
   * Get recent activity — latest logs and alerts.
   *
   * @returns Recent logs and recent alerts
   */
  @Get('recent-activity')
  async getRecentActivity() {
    return this.dashboardService.getRecentActivity();
  }

  /**
   * Get top threat sources — most active IPs and countries.
   *
   * @returns Top IPs and top countries
   */
  @Get('top-sources')
  async getTopSources() {
    return this.dashboardService.getTopSources();
  }
}

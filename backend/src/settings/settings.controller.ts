import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto.js';
import { UpdatePlatformSettingDto } from './dto/update-platform-settings.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('profile')
  getProfile(@CurrentUser('id') userId: string) {
    return this.settingsService.getProfile(userId);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.settingsService.updateProfile(userId, dto);
  }

  @Post('change-password')
  changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.settingsService.changePassword(userId, dto);
  }

  @Get('notifications')
  getNotificationSettings(@CurrentUser('id') userId: string) {
    return this.settingsService.getNotificationSettings(userId);
  }

  @Patch('notifications')
  updateNotificationSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    return this.settingsService.updateNotificationSettings(userId, dto);
  }

  @Get('platform')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getPlatformSettings() {
    return this.settingsService.getPlatformSettings();
  }

  @Patch('platform')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  updatePlatformSetting(@Body() dto: UpdatePlatformSettingDto) {
    return this.settingsService.updatePlatformSetting(dto);
  }

  @Get('system-info')
  getSystemInfo() {
    return this.settingsService.getSystemInfo();
  }
}

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto.js';
import { UpdatePlatformSettingDto } from './dto/update-platform-settings.dto.js';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid current password');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    this.logger.log(`User ${userId} changed password`);
    return { success: true, message: 'Password updated successfully' };
  }

  async getNotificationSettings(userId: string) {
    let settings = await this.prisma.notificationSetting.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await this.prisma.notificationSetting.create({
        data: {
          userId,
          emailAlerts: true,
          dashboardAlerts: true,
          severityThreshold: 'MEDIUM',
        },
      });
    }

    return settings;
  }

  async updateNotificationSettings(userId: string, dto: UpdateNotificationSettingsDto) {
    return this.prisma.notificationSetting.upsert({
      where: { userId },
      create: {
        userId,
        ...dto,
      },
      update: dto,
    });
  }

  async getPlatformSettings() {
    return this.prisma.platformSetting.findMany();
  }

  async updatePlatformSetting(dto: UpdatePlatformSettingDto) {
    // If value is passed in, ensure it is serializable to JSON
    // The Prisma schema expects `value` to be Json
    return this.prisma.platformSetting.upsert({
      where: { key: dto.key },
      create: {
        key: dto.key,
        value: dto.value !== undefined ? dto.value : {},
        category: dto.category || 'general',
      },
      update: {
        value: dto.value,
        ...(dto.category && { category: dto.category }),
      },
    });
  }

  async getSystemInfo() {
    const userCount = await this.prisma.user.count();
    const alertCount = await this.prisma.alert.count();
    const threatScoreCount = await this.prisma.threatScore.count();

    return {
      version: '2.4.0',
      environment: this.configService.get<string>('NODE_ENV') || 'development',
      uptime: process.uptime(),
      database: {
        users: userCount,
        alerts: alertCount,
        threatScores: threatScoreCount,
      },
    };
  }
}

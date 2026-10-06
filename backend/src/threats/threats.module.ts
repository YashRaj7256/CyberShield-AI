import { Module } from '@nestjs/common';
import { ThreatsController } from './threats.controller.js';
import { ThreatsService } from './threats.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ThreatsController],
  providers: [ThreatsService],
  exports: [ThreatsService],
})
export class ThreatsModule {}

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService wraps the Prisma ORM client and integrates
 * its lifecycle with NestJS module init/destroy hooks.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
  }

  /**
   * Connect to the database when the module initialises.
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to PostgreSQL database…');
    await this.$connect();
    this.logger.log('PostgreSQL connection established');
  }

  /**
   * Disconnect from the database when the module is destroyed.
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from PostgreSQL database…');
    await this.$disconnect();
    this.logger.log('PostgreSQL connection closed');
  }
}

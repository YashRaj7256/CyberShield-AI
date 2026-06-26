import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

/**
 * Service handling CRUD operations for platform users.
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieve all users with pagination.
   *
   * @param page - Page number (1-indexed)
   * @param limit - Number of items per page
   * @returns Paginated list of users (without passwords)
   */
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          isVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieve a single user by ID.
   *
   * @param id - User UUID
   * @returns User object (without password)
   * @throws NotFoundException if user does not exist
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedAlerts: true,
            auditLogs: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  /**
   * Update user fields.
   *
   * @param id - User UUID
   * @param dto - Fields to update
   * @returns Updated user object
   * @throws NotFoundException if user does not exist
   */
  async update(id: string, dto: UpdateUserDto) {
    // Check user exists
    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User updated: ${user.email}`);
    return user;
  }

  /**
   * Soft-delete a user by deactivating their account.
   *
   * @param id - User UUID
   * @returns Confirmation message
   * @throws NotFoundException if user does not exist
   */
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`User deactivated: ${id}`);
    return { message: `User ${id} has been deactivated` };
  }
}

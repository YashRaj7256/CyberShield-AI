import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

/**
 * Handles user management endpoints.
 * All endpoints require JWT authentication.
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * List all users with pagination (admin only).
   *
   * @param page - Page number (default 1)
   * @param limit - Items per page (default 20)
   * @returns Paginated list of users
   */
  @Get()
  @Roles('ADMIN')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.usersService.findAll(page, limit);
  }

  /**
   * Get a single user by ID.
   *
   * @param id - User UUID
   * @returns User profile
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Update a user's details.
   *
   * @param id - User UUID
   * @param dto - Fields to update
   * @returns Updated user
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  /**
   * Deactivate a user account (admin only).
   *
   * @param id - User UUID
   * @returns Confirmation message
   */
  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

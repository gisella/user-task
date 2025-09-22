import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User, UserCoreService } from '@app/core/user';
import { JwtAuthGuard } from '@app/auth';
import { UserId } from '../decorators/user-id.decorator';

@ApiTags('User Management')
@ApiBearerAuth('bearer')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserCoreService) {}

  @Get('/me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a user ',
    description: 'Retrieve the authenticated user details',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async geCurrentUser(@UserId() userId: string): Promise<User> {
    if (userId === null) throw new NotFoundException('User not found');
    this.logger.log(`Getting user by id: ${userId}`);
    const user = await this.userService.getUserById(userId);
    if (user === null) {
      throw new NotFoundException('User not found');
    }
    if (user.id !== userId) {
      throw new ForbiddenException('User not found');
    }
    return user;
  }
}

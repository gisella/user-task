import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NewUserRequestDto } from './dto/new-user-request.dto';
import { User, UserCoreService } from '@app/core/user';
import { Public } from '../decorators/public.decorator';
import type { Request, Response } from 'express';
import { LoginRequestDto } from './dto/login-request.dto';
import { AuthService } from '@app/auth/auth.service';
import { LocalAuthGuard } from '@app/auth/guard/local-auth-guard.service';

@ApiTags('Authentication')
@Controller('auth')
@Public()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly userService: UserCoreService,
    private readonly authService: AuthService,
  ) {}

  @Post('/signup')
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user',
  })
  @ApiBody({
    type: NewUserRequestDto,
    description: '',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async createUser(@Body() newUserRequest: NewUserRequestDto): Promise<User> {
    this.logger.log(`Creating new user: ${newUserRequest.email}`);
    return await this.userService.createUser(newUserRequest.toUser());
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate user',
    description: 'Validates credentials and returns a JWT access token',
  })
  @ApiBody({
    type: LoginRequestDto,
    description: 'User credentials',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful. Authorization header is set and token is returned in body',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): { access_token: string } {
    const token = this.authService.login((req as any).user);
    res.setHeader('Authorization', `Bearer ${token.access_token}`);
    return token;
  }
}

import { Controller, Get, Logger } from '@nestjs/common';
import { UserCoreService } from '@app/core/user';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly leadCoreService: UserCoreService) {}

  @Get('/')
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Returns service health status',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  getHealth(): { status: string; timestamp: string } {
    this.logger.log('Health check endpoint');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

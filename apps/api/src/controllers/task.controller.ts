import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  PartialType,
} from '@nestjs/swagger';
import { Task, TaskCoreService, TaskStatus } from '@app/core/task';
import { TaskParamsDto } from './dto/taskParam.dto';
import { NewTaskRequestDto } from './dto/new-task-request.dto';
import { JwtAuthGuard } from '@app/auth';
import { UserId } from '../decorators/user-id.decorator';
import { ListTaskRequestDto, PaginatedResultDto } from './dto/paginated.dto';

@ApiTags('User task Management')
@ApiBearerAuth('bearer')
@Controller('task')
@UseGuards(JwtAuthGuard)
export class TaskController {
  private readonly logger = new Logger(TaskController.name);

  constructor(private readonly taskService: TaskCoreService) {}

  @Delete('/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a task',
    description: 'Delete a task by its ID',
  })
  @ApiParam({
    name: 'taskId',
    description: 'The ID of the task',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The task has been successfully deleted.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async deleteTask(
    @Param() params: TaskParamsDto,
    @UserId() userId: string,
  ): Promise<void> {
    this.logger.log(`Get a task: ${params.taskId}`);
    await this.taskService.delete(params.taskId, userId);
  }

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiOperation({
    summary: 'Create a task',
    description: 'Create a task for the authenticated user',
  })
  @ApiParam({
    name: 'taskId',
    description: 'The ID of the task',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The task has been successfully retrieved.',
    type: Task,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async createTask(
    @Body() body: NewTaskRequestDto,
    @UserId() userId: string,
  ): Promise<Task> {
    this.logger.log('...create a new task');
    const newTask = body.toTask();
    newTask.userId = userId;
    const task = await this.taskService.createTask(newTask);
    if (task) return task;
    throw new NotFoundException('Task not found');
  }

  @Put('/:taskId')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiBody({
    type: PartialType<NewTaskRequestDto>,
    description: 'Task data',
  })
  @ApiOperation({
    summary: 'Create a task',
    description: 'Create a task for the authenticated user',
  })
  @ApiParam({
    name: 'taskId',
    description: 'The ID of the task',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The task has been successfully retrieved.',
    type: Task,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async updateTask(
    @Body() body: Partial<NewTaskRequestDto>,
    @Param() params: TaskParamsDto,
    @UserId() userId: string,
  ): Promise<Task> {
    this.logger.log('...create a new task');

    const task = await this.taskService.updateTask(params.taskId, userId, body);
    if (task) return task;
    throw new NotFoundException('Task not found');
  }

  @Get('/:taskId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a task',
    description: 'Get a task by its ID',
  })
  @ApiParam({
    name: 'taskId',
    description: 'The ID of the task',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The task has been successfully retrieved.',
    type: Task,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async getTask(
    @Param() params: TaskParamsDto,
    @UserId() userId: string,
  ): Promise<Task> {
    this.logger.log(`Get a task: ${params.taskId}`);
    const task = await this.taskService.getTask(params.taskId, userId);
    if (task) return task;
    throw new NotFoundException('Task not found');
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'list a task',
    description: ' list all user tasks',
  })
  @ApiQuery({
    type: ListTaskRequestDto,
    description: 'Task data',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The task has been successfully retrieved.',
    type: PaginatedResultDto<Task>,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async listTask(
    @UserId() userId: string,
    @Query() query: ListTaskRequestDto,
  ): Promise<PaginatedResultDto<Task>> {
    const { items, total } = await this.taskService.listTask({
      userId,
      title: query?.title,
      status: query?.status,
      createdAt: query?.createdAt,
      orderBy: query?.orderBy as 'id' | 'title',
      sortOrder: query?.sortOrder,
      limit: query.limit,
      offset: query.offset,
    });

    return new PaginatedResultDto<Task>({
      items: items,
      totalCount: total,
      limit: query.limit,
      offset: query.offset,
      hasMore: total > query.offset + query.limit,
    });
  }
}

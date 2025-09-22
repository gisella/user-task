import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  Task,
  TaskList,
  TaskRepositoryI,
  TaskSearchParams,
  TaskStatus,
} from '@app/core/task/domain';

@Injectable()
export class TaskCoreService {
  private readonly logger = new Logger(TaskCoreService.name);

  constructor(private readonly taskRepository: TaskRepositoryI) {}

  async createTask(task: Task): Promise<Task> {
    return await this.taskRepository.save(task);
  }

  async updateTask(
    taskId: string,
    userId: string,
    fields: { status?: string; description?: string; title?: string },
  ): Promise<Task> {
    const task = await this.taskRepository.findTask(taskId);
    if (!task) {
      throw new NotFoundException();
    }
    if (task.userId !== userId) {
      throw new ForbiddenException();
    }
    if (!fields.title && !fields.description && !fields.status) {
      return task;
    }
    if (fields.title !== undefined && fields.title !== null) {
      task.title = fields.title;
    }
    if (fields.description !== undefined && fields.description !== null) {
      task.description = fields.description;
    }
    if (fields.status !== undefined && fields.status !== null) {
      if (
        typeof fields.status === 'string' &&
        Object.values(TaskStatus).includes(fields.status as TaskStatus)
      ) {
        task.status = fields.status as TaskStatus;
      } else {
        this.logger.warn(`Status non valido ricevuto: ${fields.status}`);
        throw new BadRequestException(`Status non valido: ${fields.status}`);
      }
    }
    return await this.taskRepository.save(task);
  }

  async delete(taskId: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findTask(taskId);
    if (task?.userId !== userId) {
      throw new ForbiddenException();
    }
    return await this.taskRepository.deleteTask(taskId);
  }

  async getTask(taskId: string, userId: string): Promise<Task | null> {
    const task = await this.taskRepository.findTask(taskId);
    if (task?.userId !== userId) {
      throw new ForbiddenException();
    }
    return task;
  }

  async listTask(taskSearch: TaskSearchParams): Promise<TaskList> {
    return await this.taskRepository.listTask(taskSearch);
  }
}

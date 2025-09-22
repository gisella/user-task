import { Injectable, Logger } from '@nestjs/common';
import { Task, TaskRepositoryI, TaskSearchParams } from '@app/core/task/domain';

@Injectable()
export class TaskCoreService {
  private readonly logger = new Logger(TaskCoreService.name);

  constructor(private readonly taskRepository: TaskRepositoryI) {}

  async createTask(task: Task): Promise<Task> {
    return await this.taskRepository.save(task);
  }
  async delete(taskId: number): Promise<void> {
    return await this.taskRepository.deleteTask(taskId);
  }
  async getTask(taskId: number): Promise<Task | null> {
    return await this.taskRepository.findTask(taskId);
  }
  async listTask(taskSearch: TaskSearchParams): Promise<Task[] | null> {
    return await this.taskRepository.listTask(taskSearch);
  }
}

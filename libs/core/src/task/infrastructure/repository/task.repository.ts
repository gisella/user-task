import { Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@app/database';
import { Task, TaskRepositoryI, TaskSearchParams } from '@app/core/task/domain';
import { TaskMapper } from '@app/core/task/infrastructure/mappers/task.mapper';

export class TaskRepository extends TaskRepositoryI {
  private readonly logger = new Logger(TaskRepository.name);
  private readonly baseEntity = 'tasks';
  constructor(private readonly databaseService: DatabaseService) {
    super();
  }

  async save(task: Task): Promise<Task> {
    let newTask;
    try {
      if (task.id) {
        newTask = await this.databaseService[this.baseEntity].upsert({
          where: { id: BigInt(task.id) },
          update: TaskMapper.toDbEntity(task),
          create: TaskMapper.toDbEntity(task),
        });

        this.logger.log(`Task saved with ID: ${newTask.id}`);
      } else {
        newTask = await this.databaseService[this.baseEntity].create({
          data: TaskMapper.toDbEntity(task),
        });
        this.logger.log(`Task created with ID: ${newTask.id}`);
      }
      return TaskMapper.toEntity(newTask);
    } catch (error) {
      this.logger.error('Failed to create task:', error);
      throw error;
    }
  }
  async deleteTask(taskId: number): Promise<void> {
    try {
      await this.databaseService[this.baseEntity].delete({
        where: { id: BigInt(taskId) },
      });
      this.logger.log(`Task deleted with ID: ${taskId}`);
    } catch (error) {
      this.logger.error(`Failed to delete task with ID: ${taskId}`, error);
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Task with ID ${taskId} not found`);
      }
      throw error;
    }
  }

  async findTask(taskId: number): Promise<Task | null> {
    try {
      const dbTask = await this.databaseService[this.baseEntity].findFirst({
        where: {
          id: BigInt(taskId),
        },
      });
      return dbTask ? TaskMapper.toEntity(dbTask) : null;
    } catch (error) {
      this.logger.error(`Failed to fetch task with params: ${taskId}`, error);
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Task with ID ${taskId} not found`);
      }
      return null;
    }
  }
  async listTask(searchParams: TaskSearchParams): Promise<Task[] | null> {
    try {
      const tasks = await this.databaseService[this.baseEntity].findMany({
        where: {
          userId: BigInt(searchParams.userId),
          ...(searchParams.title
            ? { title: { contains: searchParams.title, mode: 'insensitive' } }
            : {}),
          ...(searchParams.status
            ? { taskStatus: searchParams.status as any }
            : {}),
        },
        orderBy: { createdAt: 'desc' },
      });
      return tasks.map((dbTask) => TaskMapper.toEntity(dbTask));
    } catch (error) {
      this.logger.error(
        'Failed to list tasks with provided search parameters',
        error,
      );
      return [];
    }
  }
}

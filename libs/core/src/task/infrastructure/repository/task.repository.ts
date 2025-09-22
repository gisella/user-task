import { Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService, UserTypes } from '@app/database';
import {
  Task,
  TaskList,
  TaskRepositoryI,
  TaskSearchParams,
} from '@app/core/task/domain';
import { TaskMapper } from '@app/core/task/infrastructure/mappers/task.mapper';

export class TaskRepository extends TaskRepositoryI {
  private readonly logger = new Logger(TaskRepository.name);
  private readonly baseEntity = 'tasks';
  constructor(private readonly databaseService: DatabaseService) {
    super();
  }

  async save(task: Task): Promise<Task> {
    let newTask: UserTypes.tasks;
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
  async deleteTask(taskId: string): Promise<void> {
    try {
      await this.databaseService[this.baseEntity].delete({
        where: { id: BigInt(taskId) },
      });
      this.logger.log(`Task deleted with ID: ${taskId}`);
    } catch (error) {
      this.logger.error(`Failed to delete task with ID: ${taskId}`, error);
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Task not found`);
      }
      throw error;
    }
  }

  async findTask(taskId: string): Promise<Task | null> {
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

  async listTask(searchParams: TaskSearchParams): Promise<TaskList> {
    try {
      const where: Record<string, unknown> = {
        user_id: BigInt(searchParams.userId),
        ...(searchParams.title
          ? { title: { contains: searchParams.title, mode: 'insensitive' } }
          : {}),
        ...(searchParams.status
          ? { taskStatus: searchParams.status as any }
          : {}),
      };

      const total = await this.databaseService[this.baseEntity].count({
        where,
      });

      const limit = searchParams.limit ?? 10;
      const offset = searchParams.offset ?? 0;
      const orderBy = searchParams.orderBy ?? 'id';
      const sortOrder = searchParams.sortOrder ?? 'desc';

      const datas = await this.databaseService[this.baseEntity].findMany({
        where,
        orderBy: { [orderBy]: sortOrder },
        skip: offset,
        take: limit,
      });

      return {
        items: datas.map((dbTask) => TaskMapper.toEntity(dbTask)),
        total,
        offset: offset + limit,
      };
    } catch (error) {
      this.logger.error(
        'Failed to list tasks with provided search parameters',
        error,
      );
      return {
        items: [],
        total: 0,
        offset: searchParams.offset ?? 0,
      };
    }
  }
}

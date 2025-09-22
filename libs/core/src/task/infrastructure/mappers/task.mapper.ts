import { UserTypes } from '@app/database';
import { DateTime } from 'luxon';
import { Task, TaskStatus } from '@app/core/task/domain';

export class TaskMapper {
  static toEntity(dbTask: UserTypes.tasks): Task {
    return new Task({
      id: dbTask.id.toString(),
      userId: dbTask.user_id.toString(),
      title: dbTask.title,
      description: dbTask.description,
      status: (dbTask.taskStatus ?? TaskStatus.NEW) as TaskStatus,
      createdAt:
        dbTask.createdAt instanceof Date
          ? DateTime.fromJSDate(dbTask.createdAt)
          : DateTime.fromISO(String(dbTask.createdAt)),
    });
  }

  static toDbEntity(task: Task): UserTypes.Prisma.tasksCreateInput {
    return {
      ...(task.id ? { id: BigInt(task.id) } : {}),
      user_id: BigInt(task.userId),
      title: task.title,
      description: task.description,
      ...(task.status
        ? { taskStatus: task.status as UserTypes.TaskStatus }
        : {}),
    } as UserTypes.Prisma.tasksCreateInput;
  }
}

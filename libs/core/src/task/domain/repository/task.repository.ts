import { Task, TaskStatus } from '@app/core/task';

export interface TaskSearchParams {
  userId: number;
  taskId?: number;
  title?: string;
  status?: TaskStatus;
}
export abstract class TaskRepositoryI {
  abstract save(task: Task): Promise<Task>;
  abstract deleteTask(taskId: number): Promise<void>;
  abstract findTask(taskId: number): Promise<Task | null>;
  abstract listTask(searchParams: TaskSearchParams): Promise<Task[] | null>;
}

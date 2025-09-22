import { Task, TaskStatus } from '@app/core/task';

export interface TaskSearchParams {
  userId: string;
  title?: string;
  status?: string;
  createdAt?: { from?: string; to?: string };
  orderBy?: 'id' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
export interface TaskList {
  items: Task[];
  total: number;
  offset: number;
}
export abstract class TaskRepositoryI {
  abstract save(task: Task): Promise<Task>;
  abstract deleteTask(taskId: string): Promise<void>;
  abstract findTask(taskId: string): Promise<Task | null>;
  abstract listTask(searchParams: TaskSearchParams): Promise<TaskList>;
}

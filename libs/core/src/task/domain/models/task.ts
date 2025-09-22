import { DateTime } from 'luxon';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum TaskStatus {
  NEW = 'NEW',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  ERROR = 'ERROR',
  REJECTED = 'REJECTED',
  DELETED = 'DELETED',
}

export class Task {
  @ApiProperty({
    description: 'Task id',
    example: '123',
  })
  id: number;
  @ApiProperty({
    description: 'Task id',
    example: '123',
  })
  userId: number;
  @ApiProperty({
    description: 'Short title describing the task',
    example: 'First task title',
  })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the task',
    example: 'This is the description of the first task.',
  })
  description: string;

  @ApiProperty({
    description: 'Current status of the task',
    enum: TaskStatus,
    example: TaskStatus.NEW,
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'Creation timestamp of the task (ISO 8601 date string)',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Transform(({ value }: { value: DateTime }) => value?.toISO?.(), {
    toPlainOnly: true,
  })
  createdAt: DateTime;

  constructor(data: Partial<Task>) {
    Object.assign(this, data);
  }
}

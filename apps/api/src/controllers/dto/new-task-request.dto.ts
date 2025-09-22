import { IsDefined, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Task, TaskStatus } from '@app/core/task';
import { Transform } from 'class-transformer';

export class NewTaskRequestDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @ApiProperty({
    description: 'task title',
    example: 'Title',
  })
  title: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Task status',
    enum: TaskStatus,
    example: 'PROCESSING',
  })
  status?: TaskStatus;

  toTask(): Task {
    return new Task({
      title: this.title,
      description: this.description,
    });
  }
}

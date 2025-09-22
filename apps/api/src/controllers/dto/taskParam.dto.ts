import { IsString } from 'class-validator';

export class TaskParamsDto {
  @IsString()
  taskId: string;
}

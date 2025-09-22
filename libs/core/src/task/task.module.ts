import { Module } from '@nestjs/common';
import { DatabaseModule, DatabaseService } from '@app/database';
import { TaskCoreService, TaskRepositoryI } from '@app/core/task/domain';
import { TaskRepository } from '@app/core/task/infrastructure';

@Module({
  imports: [DatabaseModule],
  providers: [
    TaskCoreService,
    {
      provide: TaskRepositoryI,
      useFactory: (databaseService: DatabaseService) => {
        return new TaskRepository(databaseService);
      },
      inject: [DatabaseService],
    },
  ],
  exports: [TaskCoreService],
})
export class TaskModule {}

import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { AuthModule } from '@app/auth';
import { UserModule } from '@app/core/user';
import { TaskModule } from '@app/core/task';

@Module({
  imports: [DatabaseModule, AuthModule, UserModule, TaskModule],
  providers: [],
  exports: [UserModule, TaskModule, AuthModule],
})
export class CoreModule {}

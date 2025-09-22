import { Module } from '@nestjs/common';
import { TransactionManager } from './transaction-manager.service';
import { DatabaseService } from '@app/database/database.service';

@Module({
  providers: [DatabaseService, TransactionManager],
  exports: [DatabaseService, TransactionManager],
})
export class DatabaseModule {}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '../generated-client/user-types';
import { DatabaseService } from '@app/database/database.service';

export type PrismaClientDb = PrismaClient;

@Injectable()
export class TransactionManager {
  private readonly logger = new Logger(TransactionManager.name);

  constructor(private readonly client: DatabaseService) {}

  async executeTransaction<T>(
    callback: (transaction: PrismaClientDb) => Promise<T>,
    timeout = 100000,
  ): Promise<T> {
    try {
      this.logger.debug('TransactionManager executeTransaction');
      return await this.client.$transaction(
        (transaction: PrismaClientDb) => callback(transaction),
        { timeout },
      );
    } catch (error) {
      this.logger.error('Transaction failed:', error);
      throw error;
    }
  }
}

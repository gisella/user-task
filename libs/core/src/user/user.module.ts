import { Module } from '@nestjs/common';
import { DatabaseModule, DatabaseService } from '@app/database';
import { UserCoreService, UserRepositoryI } from '@app/core/user/domain';
import { UserRepository } from '@app/core/user/infrastructure';
import { CryptModule } from '@app/crypt/crypt.module';

@Module({
  imports: [DatabaseModule, CryptModule],
  providers: [
    UserCoreService,
    {
      provide: UserRepositoryI,
      useFactory: (databaseService: DatabaseService) => {
        return new UserRepository(databaseService);
      },
      inject: [DatabaseService],
    },
  ],
  exports: [UserCoreService],
})
export class UserModule {}

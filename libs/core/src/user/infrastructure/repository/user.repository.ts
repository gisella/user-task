import { Logger } from '@nestjs/common';

import { DatabaseService } from '@app/database';
import { User, UserRepositoryI } from '@app/core/user/domain';
import { UserMapper } from '@app/core/user/infrastructure/mappers/user.mapper';

export class UserRepository extends UserRepositoryI {
  private readonly logger = new Logger(UserRepository.name);
  private readonly baseEntity = 'users';

  constructor(private readonly databaseService: DatabaseService) {
    super();
    //this.db=this.databaseService[this.baseEntity]; @todo generalizzazione database
  }

  async create(user: User): Promise<User> {
    try {
      const createdUser = await this.databaseService[this.baseEntity].create({
        data: UserMapper.toDbEntity(user),
      });

      this.logger.log(`User created with ID: ${createdUser.id}`);
      return UserMapper.toEntity(createdUser);
    } catch (error) {
      this.logger.error('Failed to create user:', error);
      throw error;
    }
  }

  async getUser(email: string): Promise<User | null> {
    try {
      const user = await this.databaseService[this.baseEntity].findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        return null;
      }
      return UserMapper.toEntity(user);
    } catch (error) {
      this.logger.error(`Error fetching lead with email ${email}:`, error);
      return null;
    }
  }
}

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { User, UserRepositoryI } from '@app/core/user/domain';
import { CryptService } from '@app/crypt/crypt.service';
import { use } from 'passport';

@Injectable()
export class UserCoreService {
  private readonly logger = new Logger('UserCoreService');

  constructor(
    private readonly userRepository: UserRepositoryI,
    private readonly cryptService: CryptService,
  ) {}

  async createUser(user: User): Promise<User> {
    const userFound = await this.userRepository.getByEmail(user.email);
    if (userFound) {
      throw new BadRequestException('Email already in use');
    }
    user.password = await this.cryptService.crypt(user.password);
    return await this.userRepository.create(user);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      if (email === null || email === undefined || email.length === 0) {
        return null;
      }
      return await this.userRepository.getByEmail(email);
    } catch (e) {
      this.logger.error(e, {
        message: 'Error getting user by email',
        service: 'UserCoreService',
        email,
      });
      return null;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      if (userId === null || userId === undefined || userId.length === 0) {
        return null;
      }
      return await this.userRepository.getById(userId);
    } catch (e) {
      this.logger.error(e, {
        message: 'Error getting user by userId',
        service: 'UserCoreService',
        userId,
      });
      return null;
    }
  }
}

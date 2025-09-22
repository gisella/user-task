import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { User, UserRepositoryI } from '@app/core/user/domain';
import { CryptService } from '@app/auth/crypt.service';

@Injectable()
export class UserCoreService {
  private readonly logger = new Logger('UserCoreService');

  constructor(
    private readonly userRepository: UserRepositoryI,
    private readonly cryptService: CryptService,
  ) {}

  async createUser(user: User): Promise<User> {
    const userFound = await this.userRepository.getUser(user.email);
    if (userFound) {
      throw new BadRequestException('Email already in use');
    }
    user.password = await this.cryptService.crypt(user.password);
    return await this.userRepository.create(user);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.getUser(email);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserCoreService } from '@app/core/user/domain';
import { CryptService } from '@app/crypt';

export type TokenClaim = {
  email: string;
  sub: string;
};
export type UserDecodedClaim = {
  email: string;
  userId: string;
};
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly salt = 5;
  constructor(
    private readonly userService: UserCoreService,
    private readonly cryptService: CryptService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.userService.getUserByEmail(email);
      if (user && (await this.cryptService.compare(password, user.password))) {
        return user;
      }
      return null;
    } catch (e) {
      this.logger.error(e, {
        service: 'AuthService',
        method: 'validateUser',
        email,
      });
      return null;
    }
  }

  login(user: User): { access_token: string } {
    const payload: TokenClaim = {
      email: user.email,
      sub: user.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

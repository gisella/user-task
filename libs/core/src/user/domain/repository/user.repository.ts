import { User } from '@app/core/user';

export abstract class UserRepositoryI {
  abstract create(user: User): Promise<User>;
  abstract getUser(email: string): Promise<User | null>;
}

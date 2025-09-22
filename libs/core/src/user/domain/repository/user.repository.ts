import { User } from '@app/core/user';

export abstract class UserRepositoryI {
  abstract create(user: User): Promise<User>;
  abstract getByEmail(email: string): Promise<User | null>;
  abstract getById(userId: string): Promise<User | null>;
}

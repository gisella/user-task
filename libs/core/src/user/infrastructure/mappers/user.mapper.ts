import { User } from '@app/core/user';
import { UserTypes } from '@app/database';

export class UserMapper {
  static toEntity(dbuser: UserTypes.users): User {
    return new User({
      id: dbuser.id.toString(),
      email: dbuser.email,
      createAt: dbuser.createdAt,
      //status: dbuser.status.toString(), @todo controllare come mai non viene valorizzata
      firstName: dbuser.name,
      password: dbuser.password,
    });
  }

  static toDbEntity(user: User): UserTypes.Prisma.usersCreateInput {
    return {
      ...(user.id ? { id: BigInt(user.id) } : {}),
      email: user.email,
      name: user.firstName,
      password: user.password,
    };
  }
}

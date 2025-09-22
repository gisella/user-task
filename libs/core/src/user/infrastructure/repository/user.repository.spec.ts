import { UserRepository } from './user.repository';
import { DatabaseService } from '@app/database';
import { UserMapper } from '@app/core/user/infrastructure/mappers/user.mapper';
import { User } from '@app/core/user';

const makeDbUser = (overrides: Partial<any> = {}) => ({
  id: BigInt(1),
  email: 'john@example.com',
  name: 'John',
  password: 'hashedPwd',
  createdAt: new Date(),
  ...overrides,
});

describe('UserRepository', () => {
  let repo: UserRepository;
  let db: any;

  beforeEach(() => {
    db = {
      users: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    } as unknown as DatabaseService;

    repo = new UserRepository(db as DatabaseService);
  });

  describe('create', () => {
    it('maps input, calls database and returns mapped entity', async () => {
      const user = new User({
        id: '1',
        email: 'john@example.com',
        password: 'hashedPwd',
        firstName: 'John',
      });

      const toDbSpy = jest.spyOn(UserMapper, 'toDbEntity');
      const toEntitySpy = jest.spyOn(UserMapper, 'toEntity');

      const dbUser = makeDbUser();
      (db.users.create as jest.Mock).mockResolvedValue(dbUser);

      const result = await repo.create(user);

      expect(toDbSpy).toHaveBeenCalledWith(user);
      expect(db.users.create).toHaveBeenCalledWith({
        data: expect.any(Object),
      });
      expect(toEntitySpy).toHaveBeenCalledWith(dbUser);
      expect(result).toBeInstanceOf(User);
      expect(result.email).toBe('john@example.com');
    });

    it('rethrows when database create fails', async () => {
      const user = new User({
        id: '1',
        email: 'john@example.com',
        password: 'hashedPwd',
        firstName: 'John',
      });
      (db.users.create as jest.Mock).mockRejectedValue(new Error('db error'));
      await expect(repo.create(user)).rejects.toBeInstanceOf(Error);
    });
  });

  describe('getByEmail', () => {
    it('returns null when not found', async () => {
      (db.users.findUnique as jest.Mock).mockResolvedValue(null);
      const res = await repo.getByEmail('nope@example.com');
      expect(db.users.findUnique).toHaveBeenCalledWith({
        where: { email: 'nope@example.com' },
      });
      expect(res).toBeNull();
    });

    it('returns mapped entity when found', async () => {
      const dbUser = makeDbUser();
      (db.users.findUnique as jest.Mock).mockResolvedValue(dbUser);
      const res = await repo.getByEmail('john@example.com');
      expect(res).toBeInstanceOf(User);
      expect(res?.id).toBe('1');
    });

    it('returns null when database throws', async () => {
      (db.users.findUnique as jest.Mock).mockRejectedValue(new Error('db err'));
      const res = await repo.getByEmail('john@example.com');
      expect(res).toBeNull();
    });
  });

  describe('getById', () => {
    it('returns null for non-numeric id', async () => {
      const res = await repo.getById('abc');
      expect(res).toBeNull();
      expect(db.users.findUnique).not.toHaveBeenCalled();
    });

    it('returns null when not found', async () => {
      (db.users.findUnique as jest.Mock).mockResolvedValue(null);
      const res = await repo.getById('99');
      expect(db.users.findUnique).toHaveBeenCalledWith({ where: { id: 99 } });
      expect(res).toBeNull();
    });

    it('returns mapped entity when found', async () => {
      const dbUser = makeDbUser({ id: BigInt(42) });
      (db.users.findUnique as jest.Mock).mockResolvedValue(dbUser);
      const res = await repo.getById('42');
      expect(res).toBeInstanceOf(User);
      expect(res?.id).toBe('42');
    });

    it('returns null when database throws', async () => {
      (db.users.findUnique as jest.Mock).mockRejectedValue(new Error('db err'));
      const res = await repo.getById('1');
      expect(res).toBeNull();
    });
  });
});

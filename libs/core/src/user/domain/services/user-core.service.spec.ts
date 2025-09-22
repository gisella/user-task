import { BadRequestException } from '@nestjs/common';
import { User } from '@app/core/user';
import { UserCoreService } from './user-core.service';
import { UserRepositoryI } from '@app/core/user/domain';
import { CryptService } from '@app/crypt/crypt.service';

const makeUser = (overrides: Partial<User> = {}): User =>
  new User({
    id: '1',
    email: 'john@example.com',
    password: 'clearPwd',
    firstName: 'John',
    lastName: 'Doe',
    createAt: new Date(),
    updateAt: new Date(),
    ...overrides,
  });

describe('UserCoreService', () => {
  let service: UserCoreService;
  let repo: jest.Mocked<UserRepositoryI>;
  let crypt: jest.Mocked<CryptService>;

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      getByEmail: jest.fn(),
      getById: jest.fn(),
    } as any;

    crypt = {
      crypt: jest.fn(),
      compare: jest.fn(),
    } as any;

    service = new UserCoreService(repo, crypt);
  });

  describe('createUser', () => {
    it('throws if email already in use', async () => {
      repo.getByEmail.mockResolvedValue(makeUser());
      await expect(service.createUser(makeUser())).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(repo.getByEmail).toHaveBeenCalledWith('john@example.com');
      expect(crypt.crypt).not.toHaveBeenCalled();
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('hashes password and creates user', async () => {
      const input = makeUser();
      repo.getByEmail.mockResolvedValue(null);
      crypt.crypt.mockResolvedValue('hashedPwd');
      const created = makeUser({ password: 'hashedPwd', id: '10' });
      repo.create.mockResolvedValue(created);

      const result = await service.createUser(input);

      expect(crypt.crypt).toHaveBeenCalledWith('clearPwd');
      expect(repo.create).toHaveBeenCalledWith({
        ...input,
        password: 'hashedPwd',
      });
      expect(result).toEqual(created);
    });
  });

  describe('getUserByEmail', () => {
    it('returns null for falsy/empty input', async () => {
      expect(await service.getUserByEmail('')).toBeNull();
      expect(await service.getUserByEmail(undefined as any)).toBeNull();
      expect(await service.getUserByEmail(null as any)).toBeNull();
      expect(repo.getByEmail).not.toHaveBeenCalled();
    });

    it('returns user from repository', async () => {
      const u = makeUser();
      repo.getByEmail.mockResolvedValue(u);
      await expect(service.getUserByEmail(u.email)).resolves.toBe(u);
      expect(repo.getByEmail).toHaveBeenCalledWith(u.email);
    });

    it('returns null if repository throws', async () => {
      repo.getByEmail.mockRejectedValue(new Error('db error'));
      const res = await service.getUserByEmail('john@example.com');
      expect(res).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('returns null for falsy/empty input', async () => {
      expect(await service.getUserById('')).toBeNull();
      expect(await service.getUserById(undefined as any)).toBeNull();
      expect(await service.getUserById(null as any)).toBeNull();
      expect(repo.getById).not.toHaveBeenCalled();
    });

    it('returns user from repository', async () => {
      const u = makeUser({ id: '123' });
      repo.getById.mockResolvedValue(u);
      await expect(service.getUserById(u.id)).resolves.toBe(u);
      expect(repo.getById).toHaveBeenCalledWith('123');
    });

    it('returns null if repository throws', async () => {
      repo.getById.mockRejectedValue(new Error('db error'));
      const res = await service.getUserById('123');
      expect(res).toBeNull();
    });
  });
});

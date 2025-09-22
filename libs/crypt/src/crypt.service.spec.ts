import { Test, TestingModule } from '@nestjs/testing';
import { CryptService } from './crypt.service';
import * as bcrypt from 'bcrypt';

describe('CryptService', () => {
  let service: CryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptService],
    }).compile();

    service = module.get<CryptService>(CryptService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crypt', () => {
    it('hashes a non-empty value and is verifiable', async () => {
      const clear = 'mySecretPwd';
      const hash = await service.crypt(clear);
      expect(typeof hash).toBe('string');
      expect(hash).not.toEqual(clear);
      expect(hash.length).toBeGreaterThan(20);
      // Verify with bcrypt
      await expect(bcrypt.compare(clear, hash)).resolves.toBe(true);
    });

    it('throws on empty value', async () => {
      await expect(service.crypt('')).rejects.toThrow(/Impossibile crittografare il valore/i);
    });

    it('throws on undefined or null value', async () => {
      await expect(service.crypt(undefined as any)).rejects.toThrow(/Impossibile crittografare il valore/i);
      await expect(service.crypt(null as any)).rejects.toThrow(/Impossibile crittografare il valore/i);
    });

  });

  describe('compare', () => {
    it('returns true on matching values', async () => {
      const clear = 'topSecret1!';
      const hash = await service.crypt(clear);
      await expect(service.compare(clear, hash)).resolves.toBe(true);
    });

    it('returns false on non-matching values', async () => {
      const hash = await service.crypt('password1');
      await expect(service.compare('different', hash)).resolves.toBe(false);
    });

    it('returns false for invalid params (empty/undefined/null)', async () => {
      const hash = await service.crypt('abc');
      await expect(service.compare('', hash)).resolves.toBe(false);
      await expect(service.compare('abc', '')).resolves.toBe(false);
      await expect(service.compare(undefined as any, hash)).resolves.toBe(false);
      await expect(service.compare('abc', undefined as any)).resolves.toBe(false);
      await expect(service.compare(null as any, hash)).resolves.toBe(false);
      await expect(service.compare('abc', null as any)).resolves.toBe(false);
    });

  });
});

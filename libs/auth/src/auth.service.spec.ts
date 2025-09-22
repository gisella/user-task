import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserCoreService } from '@app/core/user/domain';
import { CryptService } from '@app/crypt/crypt.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserCoreService, useValue: { getUserByEmail: jest.fn() } },
        { provide: CryptService, useValue: { compare: jest.fn(), crypt: jest.fn() } },
        { provide: JwtService, useValue: { sign: jest.fn(() => 'token') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

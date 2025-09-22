import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '@app/core/user';
import { CryptModule } from '@app/crypt';
import { LocalAuthGuard } from './guard/local-auth-guard.service';
import { JwtAuthGuard } from './guard/jwt-auth-guard.service';
import { PassportLocalStrategyService } from './strategy/passport.local.strategy.service';
import { PassportJwtStrategyService } from './strategy/passport.jwt.strategy.service';

@Module({
  imports: [
    UserModule,
    CryptModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    LocalAuthGuard,
    JwtAuthGuard,
    AuthService,
    PassportLocalStrategyService,
    PassportJwtStrategyService,
  ],
  exports: [
    LocalAuthGuard,
    JwtAuthGuard,
    AuthService,
    PassportLocalStrategyService,
    PassportJwtStrategyService,
  ],
})
export class AuthModule {}

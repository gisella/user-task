// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenClaim, UserDecodedClaim } from '@app/auth/auth.service';

@Injectable()
export class PassportJwtStrategyService extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  validate(payload: TokenClaim): UserDecodedClaim {
    return { userId: payload.sub, email: payload.email };
  }
}

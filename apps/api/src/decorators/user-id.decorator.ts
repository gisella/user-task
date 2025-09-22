import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ExtendedExpressRequest } from '@app/core/domain/ExtendedRequest';

export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const req = ctx.switchToHttp().getRequest<ExtendedExpressRequest>();
    return req.user?.userId;
  },
);

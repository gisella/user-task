import { Request } from 'express';

export type ExtendedExpressRequest = Request & {
  correlationId: string;
  user: {
    email: string;
    userId: string;
  };
};

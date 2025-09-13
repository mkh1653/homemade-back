import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUserPayload } from '../interfaces/auth-user-payload.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): AuthUserPayload => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);

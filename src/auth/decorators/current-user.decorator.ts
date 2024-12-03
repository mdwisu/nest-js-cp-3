import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return 'this is current user';
    // const request = ctx.switchToHttp().getRequest();
    // return request.user;
  },
);

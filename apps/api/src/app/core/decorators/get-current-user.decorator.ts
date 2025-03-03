import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetCurrentUser = createParamDecorator((data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user?.[data] ?? request.user;
});

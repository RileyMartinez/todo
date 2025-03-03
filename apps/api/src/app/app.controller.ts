import { Public } from '@/app/core/decorators/public.decorator';
import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiFoundResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
    constructor() {}

    /**
     * Redirects to the Open API documentation.
     */
    @Public()
    @Get()
    @Redirect('api')
    @ApiFoundResponse({ description: 'Redirects to /api' })
    redirectToApiDocumentation(): void {}
}

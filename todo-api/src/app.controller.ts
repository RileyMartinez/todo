import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    /**
     * Retrieves a greeting message.
     * @returns The greeting message.
     */
    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
}

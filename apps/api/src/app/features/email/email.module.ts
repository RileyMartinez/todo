import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { SESV2ClientFactory } from './sesv2-client.factory';

@Module({
    controllers: [EmailController],
    providers: [EmailService, ConfigService, SESV2ClientFactory, JwtService],
    exports: [EmailService],
})
export class EmailModule {}

import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { SESV2ClientFactory } from './sesv2-client.factory';
import { ConfigService } from '@nestjs/config';
import { ValidationService } from '@/common';
import { JwtService } from '@nestjs/jwt';

@Module({
    controllers: [EmailController],
    providers: [EmailService, ConfigService, SESV2ClientFactory, ValidationService, JwtService],
})
export class EmailModule {}

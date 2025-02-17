import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { SESV2ClientFactory } from './sesv2-client.factory';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ValidationUtil } from '@/common/utils/validaton.util';

@Module({
    controllers: [EmailController],
    providers: [EmailService, ConfigService, SESV2ClientFactory, ValidationUtil, JwtService],
})
export class EmailModule {}

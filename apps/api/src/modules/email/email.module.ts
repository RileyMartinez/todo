import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '@/modules/email/email.service';
import { SESV2ClientFactory } from '@/modules/email/sesv2-client.factory';

@Module({
    providers: [EmailService, ConfigService, SESV2ClientFactory, JwtService],
    exports: [EmailService],
})
export class EmailModule {}

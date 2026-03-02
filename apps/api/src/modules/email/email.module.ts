import { EmailService } from '@/modules/email/email.service';
import { SESV2ClientFactory } from '@/modules/email/sesv2-client.factory';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
    providers: [ConfigService, SESV2ClientFactory, EmailService],
    exports: [EmailService],
})
export class EmailModule {}

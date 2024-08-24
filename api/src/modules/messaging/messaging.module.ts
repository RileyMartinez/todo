import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { SESV2ClientFactory } from './sesv2-client.factory';
import { ConfigService } from '@nestjs/config';

@Module({
    controllers: [MessagingController],
    providers: [MessagingService, ConfigService, SESV2ClientFactory],
})
export class MessagingModule {}

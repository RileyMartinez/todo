import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigConstants, EventConstants, PasswordResetEvent, ValidationService } from '@/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SESV2ClientFactory } from './sesv2-client.factory';
import { SendEmailCommand } from '@aws-sdk/client-sesv2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OtpTokenDto } from '../auth';

@Injectable()
export class EmailService {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        private readonly configService: ConfigService,
        private readonly sesv2ClientFactory: SESV2ClientFactory,
        private readonly validationService: ValidationService,
        private readonly jwtService: JwtService,
    ) {
        this.logger = logger;
        this.configService = configService;
        this.sesv2ClientFactory = sesv2ClientFactory;
        this.validationService = validationService;
        this.jwtService = jwtService;
    }

    /**
     * Sends a password reset email.
     *
     * @remarks This method is an event handler for the PASSWORD_RESET event.
     *
     * @param passwordResetEvent - The password reset event containing the email address.
     * @returns A promise that resolves when the email is sent successfully.
     * @throws {ValidationException} If the password reset event is invalid.
     */
    @OnEvent(EventConstants.PASSWORD_RESET, { async: true })
    async sendPasswordReset(passwordResetEvent: PasswordResetEvent): Promise<void> {
        await this.validationService.validateObject(passwordResetEvent);

        const client = this.sesv2ClientFactory.createClient();
        const fromEmail = this.configService.getOrThrow<string>(ConfigConstants.AWS_SES_FROM_EMAIL);
        const decodedToken = this.jwtService.decode<OtpTokenDto>(passwordResetEvent.token);

        const command = new SendEmailCommand({
            FromEmailAddress: fromEmail,
            Destination: {
                ToAddresses: [decodedToken.email],
            },
            Content: {
                Template: {
                    TemplateName: 'todo-password-reset',
                    TemplateData: JSON.stringify({
                        otp: decodedToken.otp,
                        year: new Date().getFullYear().toString(),
                    }),
                },
            },
        });

        await client.send(command);
    }
}

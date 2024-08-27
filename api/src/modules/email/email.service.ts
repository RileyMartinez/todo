import { ForbiddenException, Inject, Injectable, LoggerService } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigConstants, EventConstants, ExceptionConstants, PasswordResetEvent, ValidationService } from '@/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SESV2ClientFactory } from './sesv2-client.factory';
import { SendEmailCommand } from '@aws-sdk/client-sesv2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RawOtpTokenDto } from '../auth';
import { formatLogMessage } from '@/common/utils/logger.util';

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
        let verifiedToken: RawOtpTokenDto;

        try {
            verifiedToken = this.jwtService.verify<RawOtpTokenDto>(passwordResetEvent.token, {
                secret: this.configService.getOrThrow<string>(ConfigConstants.JWT_SECRET),
            });
        } catch (error) {
            const stack = error instanceof Error ? error.stack : ExceptionConstants.UNKNOWN_ERROR;
            this.logger.error(
                formatLogMessage('ESSPRes001', ExceptionConstants.INVALID_TOKEN, { token: passwordResetEvent.token }),
                stack,
                EmailService.name,
            );
            throw new ForbiddenException(ExceptionConstants.INVALID_TOKEN);
        }

        const command = new SendEmailCommand({
            FromEmailAddress: fromEmail,
            Destination: {
                ToAddresses: [verifiedToken.email],
            },
            Content: {
                Template: {
                    TemplateName: '66af6bd3-b733-403a-8f2c-b4e7d0fc5446-password-reset',
                    TemplateData: JSON.stringify({
                        otp: verifiedToken.otp,
                        year: new Date().getFullYear().toString(),
                    }),
                },
            },
        });

        await client.send(command);
    }
}

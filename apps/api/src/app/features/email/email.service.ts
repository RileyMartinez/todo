import { ConfigConstants } from '@/app/core/constants/config.constants';
import { formatLogMessage } from '@/app/core/utils/logger.util';
import { getFriendlyExpiration } from '@/app/core/utils/string.util';
import { SendEmailCommand } from '@aws-sdk/client-sesv2';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateOrReject } from 'class-validator';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PasswordResetEmailRequestDto } from './dto/password-reset-email-request.dto';
import { VerifyEmailRequestDto } from './dto/verify-email-request.dto';
import { SESV2ClientFactory } from './sesv2-client.factory';

@Injectable()
export class EmailService {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        private readonly configService: ConfigService,
        private readonly sesv2ClientFactory: SESV2ClientFactory,
    ) {
        this.logger = logger;
        this.configService = configService;
        this.sesv2ClientFactory = sesv2ClientFactory;
    }

    /**
     * Sends a password reset email.
     *
     * @param passwordResetEmailRequest - The dto containing the email and otp.
     * @returns A promise that resolves when the email is sent successfully.
     * @throws {ValidationError} If the password reset email request dto is invalid.
     */
    async sendPasswordReset(passwordResetEmailRequest: PasswordResetEmailRequestDto): Promise<void> {
        await validateOrReject(passwordResetEmailRequest);

        const { email, otp } = passwordResetEmailRequest;
        const client = this.sesv2ClientFactory.createClient();
        const fromEmail = this.configService.getOrThrow<string>(ConfigConstants.AWS_SES_FROM_EMAIL);
        const expiration = getFriendlyExpiration(this.configService.getOrThrow<string>(ConfigConstants.JWT_EXPIRATION));

        const templateName = 'password-reset-v1';

        const command = new SendEmailCommand({
            FromEmailAddress: fromEmail,
            Destination: {
                ToAddresses: [email],
            },
            Content: {
                Template: {
                    TemplateName: templateName,
                    TemplateData: JSON.stringify({
                        otp,
                        expiration,
                        year: new Date().getFullYear(),
                    }),
                },
            },
        });

        await client.send(command);

        this.logger.log(
            formatLogMessage('ESSPRes001', 'Password reset email sent successfully.', {
                email: email,
                templateName,
            }),
            EmailService.name,
        );
    }

    /**
     * Sends an email verification email.
     *
     * @param verifyEmailRequest - The dto containing the email and confirmation pin.
     * @returns A promise that resolves when the email is sent successfully.
     * @throws {ValidationError} If the verify email request dto is invalid.
     */
    async sendEmailVerification(verifyEmailRequest: VerifyEmailRequestDto): Promise<void> {
        await validateOrReject(verifyEmailRequest);

        const { email, confirmationPin } = verifyEmailRequest;
        const client = this.sesv2ClientFactory.createClient();
        const fromEmail = this.configService.getOrThrow<string>(ConfigConstants.AWS_SES_FROM_EMAIL);

        const templateName = 'email-verification-v1';

        const command = new SendEmailCommand({
            FromEmailAddress: fromEmail,
            Destination: {
                ToAddresses: [email],
            },
            Content: {
                Template: {
                    TemplateName: templateName,
                    TemplateData: JSON.stringify({
                        confirmationPin,
                        year: new Date().getFullYear(),
                    }),
                },
            },
        });

        await client.send(command);

        this.logger.log(
            formatLogMessage('ESSEVer001', 'Email verification email sent successfully.', {
                email: email,
                templateName,
            }),
            EmailService.name,
        );
    }
}

import { ConfigConstants } from '@/app/core/constants/config.constants';
import { getFriendlyExpiration } from '@/app/core/utils/string.util';
import { SendEmailCommand } from '@aws-sdk/client-sesv2';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateOrReject } from 'class-validator';
import { AccountVerificationEmailDto } from './dto/account-verification-email.dto';
import { PasswordResetEmailDto } from './dto/password-reset-email.dto';
import { SESV2ClientFactory } from './sesv2-client.factory';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly sesv2ClientFactory: SESV2ClientFactory,
    ) {
        this.configService = configService;
        this.sesv2ClientFactory = sesv2ClientFactory;
    }

    /**
     * Sends a password reset email.
     *
     * @param passwordResetEmailDto - The dto containing the email and otp.
     * @returns A promise that resolves when the email is sent successfully.
     * @throws {ValidationError} If the password reset email request dto is invalid.
     */
    async sendPasswordReset(passwordResetEmailDto: PasswordResetEmailDto): Promise<void> {
        await validateOrReject(passwordResetEmailDto);

        const { email, otp } = passwordResetEmailDto;
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

        try {
            await client.send(command);
            this.logger.debug({ email, templateName }, 'Password reset email sent successfully.');
        } catch (error) {
            this.logger.error({ email, templateName, error }, 'Failed to send password reset email.');
            throw error;
        }
    }

    /**
     * Sends an account verification email.
     *
     * @param accountVerificationEmailDto - The dto containing the email and confirmation pin.
     * @returns A promise that resolves when the email is sent successfully.
     * @throws {ValidationError} If the account verification dto is invalid.
     */
    async sendAccountVerification(accountVerificationEmailDto: AccountVerificationEmailDto): Promise<void> {
        await validateOrReject(accountVerificationEmailDto);

        const { email, confirmationPin } = accountVerificationEmailDto;
        const client = this.sesv2ClientFactory.createClient();
        const fromEmail = this.configService.getOrThrow<string>(ConfigConstants.AWS_SES_FROM_EMAIL);

        const templateName = 'account-verification-v1';

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

        try {
            await client.send(command);
            this.logger.debug({ email, templateName }, 'Account verification email sent successfully.');
        } catch (error) {
            this.logger.error({ email, templateName, error }, 'Failed to send account verification email.');
            throw error;
        }
    }
}

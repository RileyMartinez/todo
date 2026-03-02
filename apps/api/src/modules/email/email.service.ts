import { SESV2ClientFactory } from '@/modules/email/sesv2-client.factory';
import { TemplatedEmailOptions } from '@/modules/email/templated-email-options.interface';
import { ConfigConstants } from '@/shared/constants/config.constants';
import { SendEmailCommand } from '@aws-sdk/client-sesv2';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly sesv2ClientFactory: SESV2ClientFactory,
    ) {}

    /**
     * Sends a templated email through AWS SES.
     *
     * @param options - The recipient, template name, and template data.
     * @returns A promise that resolves when the email is sent successfully.
     */
    async sendTemplatedEmail(options: TemplatedEmailOptions): Promise<void> {
        const { to, templateName, templateData } = options;
        const client = this.sesv2ClientFactory.createClient();
        const fromEmail = this.configService.getOrThrow<string>(ConfigConstants.AWS_SES_FROM_EMAIL);

        const command = new SendEmailCommand({
            FromEmailAddress: fromEmail,
            Destination: {
                ToAddresses: [to],
            },
            Content: {
                Template: {
                    TemplateName: templateName,
                    TemplateData: JSON.stringify(templateData),
                },
            },
        });

        try {
            await client.send(command);
            this.logger.debug({ to, templateName }, 'Templated email sent successfully.');
        } catch (error) {
            this.logger.error({ to, templateName, error }, 'Failed to send templated email.');
            throw error;
        }
    }
}

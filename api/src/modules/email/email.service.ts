import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { UpdateEmailDto } from './dto/update-email.dto';
import { ConfigConstants, PasswordResetEvent } from '@/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SESV2ClientFactory } from './sesv2-client.factory';
import { SendEmailCommand } from '@aws-sdk/client-sesv2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
    private readonly passwordResetTemplate = 'todo-password-reset';

    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        private readonly configService: ConfigService,
        private readonly sesv2ClientFactory: SESV2ClientFactory,
    ) {
        this.logger = logger;
        this.configService = configService;
        this.sesv2ClientFactory = sesv2ClientFactory;
    }

    async sendPasswordResetEmail(passwordResetEvent: PasswordResetEvent) {
        const client = this.sesv2ClientFactory.createClient();
        const fromEmail = this.configService.get<string>(ConfigConstants.AWS_SES_FROM_EMAIL);

        const command = new SendEmailCommand({
            FromEmailAddress: fromEmail,
            Destination: {
                ToAddresses: [passwordResetEvent.email],
            },
            Content: {
                Template: {
                    TemplateName: this.passwordResetTemplate,
                    TemplateData: JSON.stringify({}),
                },
            },
        });

        await client.send(command);
    }

    findAll() {
        return `This action returns all messaging`;
    }

    findOne(id: number) {
        return `This action returns a #${id} messaging`;
    }

    update(id: number, updateEmailDto: UpdateEmailDto) {
        return `This action updates a #${id} messaging`;
    }

    remove(id: number) {
        return `This action removes a #${id} messaging`;
    }
}

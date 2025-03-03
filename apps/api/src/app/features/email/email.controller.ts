import { ExceptionConstants } from '@/app/core/constants/exception.constants';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PasswordResetEmailRequestDto } from './dto/password-reset-email-request.dto';
import { EmailService } from './email.service';

@Controller('email')
@ApiTags('email')
@ApiBearerAuth()
export class EmailController {
    constructor(private readonly emailService: EmailService) {
        this.emailService = emailService;
    }

    @Post('send-password-reset')
    @ApiOkResponse({ description: 'Password reset email sent successfully' })
    @ApiBadRequestResponse({ description: ExceptionConstants.VALIDATION_FAILED })
    @HttpCode(HttpStatus.OK)
    async sendPasswordReset(@Body() passwordResetEmailRequest: PasswordResetEmailRequestDto): Promise<void> {
        await this.emailService.sendPasswordReset(passwordResetEmailRequest);
    }
}

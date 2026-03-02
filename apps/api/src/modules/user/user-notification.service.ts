import { EmailService } from '@/modules/email/email.service';
import { UserProfileService } from '@/modules/user/user-profile.service';
import { UserTokenService } from '@/modules/user/user-token.service';
import { UserService } from '@/modules/user/user.service';
import { ConfigConstants } from '@/shared/constants/config.constants';
import { ExceptionConstants } from '@/shared/constants/exception.constants';
import { EncryptionUtil } from '@/shared/utils/encryption.util';
import { getFriendlyExpiration } from '@/shared/utils/string.util';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';

/** SES template names for user notifications. */
const EMAIL_TEMPLATES = {
    PASSWORD_RESET: 'password-reset-v1',
    ACCOUNT_VERIFICATION: 'account-verification-v1',
} as const;

@Injectable()
export class UserNotificationService {
    private readonly logger = new Logger(UserNotificationService.name);

    constructor(
        private readonly userService: UserService,
        private readonly userProfileService: UserProfileService,
        private readonly userTokenService: UserTokenService,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
        private readonly encryptionUtil: EncryptionUtil,
        private readonly jwtService: JwtService,
    ) {}

    /**
     * Sends an account verification confirmation message for the given user.
     *
     * @param userId - The ID of the user.
     * @throws {BadRequestException} If the user ID is not provided.
     * @throws {NotFoundException} If the user is not found.
     */
    async sendAccountVerificationMessage(userId: string): Promise<void> {
        if (!userId) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_USER_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        const user = await this.userService.findUserById(userId);

        if (!user) {
            this.logger.error({ userId }, ExceptionConstants.USER_NOT_FOUND);
            throw new NotFoundException(ExceptionConstants.USER_NOT_FOUND);
        }

        const confirmationPin = randomInt(100000, 999999);

        await Promise.all([
            this.userProfileService.updateUserVerificationCode(user.id, confirmationPin),
            this.emailService.sendTemplatedEmail({
                to: user.email,
                templateName: EMAIL_TEMPLATES.ACCOUNT_VERIFICATION,
                templateData: {
                    confirmationPin,
                    year: new Date().getFullYear(),
                },
            }),
        ]);
    }

    /**
     * Sends a password reset event for the given email.
     *
     * @remarks We intentionally do not provide feedback if the email does not exist to prevent user enumeration.
     *
     * @param email - The email of the user.
     * @returns A promise that resolves to void.
     */
    async sendPasswordResetMessage(email: string): Promise<void> {
        if (!email) {
            this.logger.error({ email }, ExceptionConstants.INVALID_EMAIL);
            throw new BadRequestException(ExceptionConstants.INVALID_EMAIL);
        }

        const user = await this.userService.findUserByEmail(email);

        if (!user) {
            this.logger.warn({ email }, ExceptionConstants.USER_NOT_FOUND);
            return;
        }

        const otp = randomInt(100000, 999999);
        const token = await this.jwtService.signAsync(
            {
                otp,
            },
            {
                secret: this.configService.getOrThrow(ConfigConstants.JWT_SECRET),
                expiresIn: this.configService.getOrThrow(ConfigConstants.JWT_EXPIRATION),
            },
        );

        const encryptedToken = this.encryptionUtil.encrypt(token);
        await this.userTokenService.updateUserToken(user.id, encryptedToken);

        const expiration = getFriendlyExpiration(this.configService.getOrThrow<string>(ConfigConstants.JWT_EXPIRATION));

        await this.emailService.sendTemplatedEmail({
            to: user.email,
            templateName: EMAIL_TEMPLATES.PASSWORD_RESET,
            templateData: {
                otp,
                expiration,
                year: new Date().getFullYear(),
            },
        });
    }
}

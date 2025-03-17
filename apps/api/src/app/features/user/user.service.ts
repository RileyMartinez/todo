import { argon2HashConfig } from '@/app/core/configs/argon2-hash.config';
import { ConfigConstants } from '@/app/core/constants/config.constants';
import { ExceptionConstants } from '@/app/core/constants/exception.constants';
import { EncryptionUtil } from '@/app/core/utils/encryption.util';
import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { validateOrReject } from 'class-validator';
import { randomInt } from 'crypto';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserContextDto } from '../auth/dto/user-context.dto';
import { AccountVerificationEmailDto } from '../email/dto/account-verification-email.dto';
import { PasswordResetEmailDto } from '../email/dto/password-reset-email.dto';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
        private readonly encryptionUtil: EncryptionUtil,
        private readonly jwtService: JwtService,
    ) {}

    /**
     * Creates a new user.
     * @param createUserDto - The data for creating a new user.
     * @returns A promise that resolves to the created user.
     * @throws {ValidationException} If user email or password is invalid.
     * @throws {InternalServerErrorException} If the user creation fails.
     */
    async createUser(createUserDto: CreateUserDto): Promise<User> {
        await validateOrReject(createUserDto);

        const user = this.userRepository.create(createUserDto);
        return await this.userRepository.save(user);
    }

    /**
     * Finds a user by their ID.
     *
     * @param userId - The ID of the user to find.
     * @returns A promise that resolves to the found user.
     * @throws {BadRequestException} If the user ID is less than 1.
     */
    async findUserById(userId: string): Promise<User | null> {
        if (!userId) {
            this.logger.error({ userId: userId }, ExceptionConstants.INVALID_USER_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        return await this.userRepository.findOneBy({ id: userId });
    }

    /**
     * Finds a user by their email.
     *
     * @param email - The email of the user to find.
     * @returns A promise that resolves to the found user, or null if not found.
     * @throws {BadRequestException} If the email is not provided.
     */
    async findUserByEmail(email: string): Promise<User | null> {
        if (!email) {
            this.logger.error({ email }, ExceptionConstants.INVALID_EMAIL);
            throw new BadRequestException(ExceptionConstants.INVALID_EMAIL);
        }

        return await this.userRepository.findOneBy({ email });
    }

    /**
     * Updates the token of a user.
     *
     * @param userId - The ID of the user.
     * @param token - The new token.
     * @returns A promise that resolves to an UpdateResult object.
     * @throws {BadRequestException} If the user ID is invalid or the token is invalid.
     * @throws {NotFoundException} If the user is not found.
     */
    async updateUserToken(userId: string, token: string): Promise<UpdateResult> {
        if (!userId) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_USER_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        if (!token) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_TOKEN);
            throw new BadRequestException(ExceptionConstants.INVALID_TOKEN);
        }

        const result = await this.userRepository.update(userId, { token, tokenVersion: () => 'tokenVersion + 1' });

        if (!result.affected) {
            this.logger.error({ userId }, ExceptionConstants.USER_NOT_FOUND);
            throw new NotFoundException(ExceptionConstants.USER_NOT_FOUND);
        }

        return result;
    }

    /**
     * Clears the token of a user. Increments the token version to invalidate the token.
     *
     * @param userId - The ID of the user.
     * @returns A promise that resolves to an UpdateResult object.
     * @throws {BadRequestException} if the provided user ID is invalid.
     * @throws {NotFoundException} if the user is not found.
     */
    async revokeUserToken(userId: string): Promise<DeleteResult> {
        if (!userId) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_USER_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        const result = await this.userRepository.update(userId, {
            token: null,
            tokenVersion: () => 'tokenVersion + 1',
        });

        if (!result.affected) {
            this.logger.error({ userId }, ExceptionConstants.USER_NOT_FOUND);
            throw new NotFoundException(ExceptionConstants.USER_NOT_FOUND);
        }

        return result;
    }

    /**
     * Updates the password of a user.
     *
     * @param userId - The ID of the user.
     * @param updatePasswordDto - The data for updating the password.
     * @returns A promise that resolves to an UpdateResult object.
     * @throws {BadRequestException} If the user ID is invalid, the current password is incorrect,
     *      or the new/confirmed passwords don't match.
     * @throws {NotFoundException} If no user is updated.
     * @throws {UnauthorizedException} If the current password is invalid.
     */
    async updateUserPassword(userId: string, updatePasswordDto: UpdatePasswordDto): Promise<UpdateResult> {
        await validateOrReject(updatePasswordDto);
        const { currentPassword, newPassword, confirmPassword } = updatePasswordDto;

        if (!userId) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_USER_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        if (newPassword !== confirmPassword) {
            const errorMessage = 'New password and confirm password do not match';
            this.logger.error({ userId }, errorMessage);
            throw new BadRequestException(errorMessage);
        }

        const user = await this.userRepository.findOneByOrFail({ id: userId });
        const match = await argon2.verify(user.password, currentPassword);

        if (!match) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_CREDENTIALS);
            throw new BadRequestException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const hash = await argon2.hash(newPassword, argon2HashConfig);

        const result = await this.userRepository.update(userId, {
            password: hash,
        });

        if (!result.affected) {
            this.logger.error({ userId }, ExceptionConstants.USER_NOT_FOUND);
            throw new NotFoundException(ExceptionConstants.USER_NOT_FOUND);
        }

        return result;
    }

    /**
     * Resets the password of a user.
     * @param userId - The ID of the user.
     * @param password - The new password.
     * @returns A promise that resolves to an UpdateResult object.
     * @throws {BadRequestException} If the user ID is invalid.
     */
    async resetUserPassword(userId: string, password: string): Promise<UpdateResult> {
        if (!userId) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_USER_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        if (!password) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_PASSWORD);
            throw new BadRequestException(ExceptionConstants.INVALID_PASSWORD);
        }

        const hash = await argon2.hash(password);

        const result = await this.userRepository.update(userId, {
            password: hash,
        });

        if (!result.affected) {
            this.logger.error({ userId }, ExceptionConstants.USER_NOT_FOUND);
            throw new NotFoundException(ExceptionConstants.USER_NOT_FOUND);
        }

        return result;
    }

    /**
     * Updates the display name of a user.
     *
     * @param userId - The ID of the user.
     * @param displayName - The new display name.
     * @returns A promise that resolves to an UpdateResult object.
     */
    async updateUserDisplayName(userId: string, displayName: string | null): Promise<UpdateResult> {
        if (!userId) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_USER_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        const result = await this.userRepository.update(userId, {
            displayName,
        });

        if (!result.affected) {
            this.logger.error({ userId }, ExceptionConstants.USER_NOT_FOUND);
            throw new NotFoundException(ExceptionConstants.USER_NOT_FOUND);
        }

        return result;
    }

    /**
     * Updates the verification code of a user for account verification.
     *
     * @param userId - The ID of the user.
     * @param verificationCode - The verification code to update.
     * @returns - A promise that resolves to an UpdateResult object.
     */
    async updateUserVerificationCode(userId: string, verificationCode: number): Promise<UpdateResult> {
        if (!userId) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_USER_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        if (!verificationCode) {
            this.logger.error({ userId, verificationCode }, ExceptionConstants.INVALID_VERIFICATION_CODE);
            throw new BadRequestException(ExceptionConstants.INVALID_VERIFICATION_CODE);
        }

        const result = await this.userRepository.update(userId, {
            verificationCode,
        });

        if (!result.affected) {
            this.logger.error({ userId }, ExceptionConstants.USER_NOT_FOUND);
            throw new NotFoundException(ExceptionConstants.USER_NOT_FOUND);
        }

        return result;
    }

    /**
     * Updates the avatar url of a user.
     *
     * @param userId - The ID of the user.
     * @param avatar - The URL of the avatar.
     * @returns A promise that resolves to an UpdateResult object.
     */
    async updateUserAvatar(userId: string, avatar: string): Promise<UpdateResult> {
        if (!userId) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_USER_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        if (!avatar) {
            this.logger.error({ userId, avatar }, ExceptionConstants.INVALID_AVATAR);
            throw new BadRequestException(ExceptionConstants.INVALID_AVATAR);
        }

        const result = await this.userRepository.update(userId, {
            avatar,
        });

        if (!result.affected) {
            this.logger.error({ userId }, ExceptionConstants.USER_NOT_FOUND);
            throw new NotFoundException(ExceptionConstants.USER_NOT_FOUND);
        }

        return result;
    }

    /**
     * Marks a user as verified.
     *
     * @param userId - The ID of the user to verify.
     * @returns A promise that resolves to an UpdateResult object.
     */
    async verifyUser(userId: string, verificationCode: number): Promise<UserContextDto> {
        if (!userId) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_USER_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        if (!verificationCode) {
            this.logger.error({ userId, verificationCode }, ExceptionConstants.INVALID_VERIFICATION_CODE);
            throw new BadRequestException(ExceptionConstants.INVALID_VERIFICATION_CODE);
        }

        const user = await this.userRepository.findOneByOrFail({ id: userId });

        if (user.verificationCode !== verificationCode) {
            this.logger.error({ userId, verificationCode }, ExceptionConstants.INVALID_VERIFICATION_CODE);
            throw new BadRequestException(ExceptionConstants.INVALID_VERIFICATION_CODE);
        }

        user.isVerified = true;
        const updatedUser = await this.userRepository.save(user);

        return UserContextDto.from(updatedUser);
    }

    /**
     * Removes a user.
     *
     * @param userId - The ID of the user to remove.
     * @returns A promise that resolves to the number of deleted rows.
     * @throws {BadRequestException} If the user ID is invalid.
     * @throws {NotFoundException} If the user to delete is not found.
     */
    async deleteUser(userId: string): Promise<DeleteResult> {
        if (!userId) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_USER_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        const result = await this.userRepository.delete(userId);

        if (!result.affected) {
            this.logger.error({ userId }, ExceptionConstants.USER_NOT_FOUND);
            throw new NotFoundException(ExceptionConstants.USER_NOT_FOUND);
        }

        return result;
    }

    /**
     * Sends an account verification confirmation message for the given email.
     *
     * @param email - The email of the user.
     * @throws {BadRequestException} If the email is not provided.
     * @throws {NotFoundException} If the user is not found.
     */
    async sendAccountVerificationMessage(userId: string): Promise<void> {
        if (!userId) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_USER_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        const user = await this.findUserById(userId);

        if (!user) {
            this.logger.error({ userId }, ExceptionConstants.USER_NOT_FOUND);
            throw new NotFoundException(ExceptionConstants.USER_NOT_FOUND);
        }

        const confirmationPin = randomInt(100000, 999999);

        await Promise.all([
            this.updateUserVerificationCode(user.id, confirmationPin),
            this.emailService.sendAccountVerification(new AccountVerificationEmailDto(user.email, confirmationPin)),
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

        const user = await this.findUserByEmail(email);

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
        await this.updateUserToken(user.id, encryptedToken);

        await this.emailService.sendPasswordReset(new PasswordResetEmailDto(user.email, otp));
    }
}

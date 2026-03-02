import { UserContextDto } from '@/common/dto/user-context.dto';
import { User } from '@/modules/user/entities/user.entity';
import { ExceptionConstants } from '@/shared/constants/exception.constants';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class UserProfileService {
    private readonly logger = new Logger(UserProfileService.name);

    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

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
     * Updates the verification code of a user for account verification.
     *
     * @param userId - The ID of the user.
     * @param verificationCode - The verification code to update.
     * @returns A promise that resolves to an UpdateResult object.
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
     * Marks a user as verified.
     *
     * @param userId - The ID of the user to verify.
     * @param verificationCode - The verification code to validate.
     * @returns A promise that resolves to a UserContextDto.
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

        return updatedUser.toUserContextDto();
    }
}

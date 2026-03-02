import { User } from '@/modules/user/entities/user.entity';
import { ExceptionConstants } from '@/shared/constants/exception.constants';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class UserTokenService {
    private readonly logger = new Logger(UserTokenService.name);

    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

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
}

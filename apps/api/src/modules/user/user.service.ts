import { argon2HashConfig } from '@/config/argon2-hash.config';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { UpdatePasswordDto } from '@/modules/user/dto/update-password.dto';
import { User } from '@/modules/user/entities/user.entity';
import { ExceptionConstants } from '@/shared/constants/exception.constants';
import { validateDto } from '@/shared/utils/validate-dto.util';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

    /**
     * Creates a new user.
     * @param createUserDto - The data for creating a new user.
     * @returns A promise that resolves to the created user.
     * @throws {ValidationException} If user email or password is invalid.
     * @throws {InternalServerErrorException} If the user creation fails.
     */
    async createUser(createUserDto: CreateUserDto): Promise<User> {
        await validateDto(createUserDto);
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
        await validateDto(updatePasswordDto);
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

        const hash = await argon2.hash(password, argon2HashConfig);

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
}

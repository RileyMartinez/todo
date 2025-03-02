import { formatLogMessage } from '@/common/utils/logger.util';
import { ValidationUtil } from '@/common/utils/validaton.util';
import { BadRequestException, Inject, Injectable, LoggerService, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { validate } from 'class-validator';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ExceptionConstants } from 'src/common/constants/exception.constants';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly validationService: ValidationUtil,
    ) {
        this.logger = logger;
        this.validationService = validationService;
    }

    /**
     * Creates a new user.
     * @param createUserDto - The data for creating a new user.
     * @returns A promise that resolves to the created user.
     * @throws {ValidationException} If user email or password is invalid.
     * @throws {InternalServerErrorException} If the user creation fails.
     */
    async createUser(createUserDto: CreateUserDto): Promise<User> {
        await this.validationService.validateObject(createUserDto);
        return await this.userRepository.save(createUserDto);
    }

    /**
     * Finds a user by their ID.
     *
     * @param id - The ID of the user to find.
     * @returns A promise that resolves to the found user.
     * @throws {BadRequestException} If the user ID is less than 1.
     */
    async findUserById(id: string): Promise<User> {
        if (!id) {
            this.logger.error(
                formatLogMessage('USFUBId001', ExceptionConstants.INVALID_USER_ID, { userId: id }),
                undefined,
                UserService.name,
            );
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        return await this.userRepository.findOneByOrFail({ id });
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
            this.logger.error('User email cannot be empty or undefined', undefined, UserService.name);
            throw new BadRequestException(ExceptionConstants.INVALID_EMAIL);
        }

        return await this.userRepository.findOneBy({ email });
    }

    /**
     * Updates the token of a user.
     *
     * @param id - The ID of the user.
     * @param token - The new token.
     * @returns A promise that resolves to an UpdateResult object.
     * @throws {BadRequestException} If the user ID is invalid or the token is invalid.
     * @throws {NotFoundException} If the user is not found.
     */
    async updateUserToken(id: string, token: string): Promise<UpdateResult> {
        if (!id) {
            this.logger.error(
                formatLogMessage('USUUTok001', ExceptionConstants.INVALID_USER_ID, { userId: id }),
                undefined,
                UserService.name,
            );
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        if (!token) {
            this.logger.error(
                formatLogMessage('USUUTok002', ExceptionConstants.INVALID_TOKEN, { userId: id }),
                undefined,
                UserService.name,
            );
            throw new BadRequestException(ExceptionConstants.INVALID_TOKEN);
        }

        const result = await this.userRepository.update(id, { token });

        if (!result.affected) {
            this.logger.error(
                formatLogMessage('USUUTok003', ExceptionConstants.USER_NOT_FOUND, { userId: id }),
                undefined,
                UserService.name,
            );
            throw new NotFoundException(ExceptionConstants.USER_NOT_FOUND);
        }

        return result;
    }

    /**
     * Clears the token of a user. Increments the token version to invalidate the token.
     *
     * @param id - The ID of the user.
     * @returns A promise that resolves to an UpdateResult object.
     * @throws {BadRequestException} if the provided user ID is invalid.
     * @throws {NotFoundException} if the user is not found.
     */
    async revokeUserToken(id: string): Promise<DeleteResult> {
        if (!id) {
            this.logger.error(
                formatLogMessage('USDUTok001', ExceptionConstants.INVALID_USER_ID, { userId: id }),
                undefined,
                UserService.name,
            );
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        const result = await this.userRepository.update(id, { token: null, tokenVersion: () => 'tokenVersion + 1' });

        if (!result.affected) {
            this.logger.error(
                formatLogMessage('USDUTok002', ExceptionConstants.USER_NOT_FOUND, { userId: id }),
                undefined,
                UserService.name,
            );
            throw new NotFoundException(ExceptionConstants.USER_NOT_FOUND);
        }

        return result;
    }

    /**
     * Updates the password of a user.
     * @param id - The ID of the user.
     * @param updatePasswordDto - The new password.
     * @returns A promise that resolves to an UpdateResult object.
     * @throws {BadRequestException} If the user ID is invalid.
     */
    async updateUserPassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<UpdateResult> {
        await validate(updatePasswordDto);

        if (!id) {
            this.logger.error(
                formatLogMessage('USUUPas001', ExceptionConstants.INVALID_USER_ID, { userId: id }),
                undefined,
                UserService.name,
            );
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        const hash = await argon2.hash(updatePasswordDto.password);

        const result = await this.userRepository.update(id, {
            password: hash,
        });

        if (!result.affected) {
            this.logger.error(
                formatLogMessage('USUUPas002', ExceptionConstants.USER_NOT_FOUND, { userId: id }),
                undefined,
                UserService.name,
            );
            throw new NotFoundException(ExceptionConstants.USER_NOT_FOUND);
        }

        return result;
    }

    /**
     * Removes a user.
     *
     * @param id - The ID of the user to remove.
     * @returns A promise that resolves to the number of deleted rows.
     * @throws {BadRequestException} If the user ID is invalid.
     * @throws {NotFoundException} If the user to delete is not found.
     */
    async deleteUser(id: string): Promise<DeleteResult> {
        if (!id) {
            this.logger.error(
                formatLogMessage('USDUse001', ExceptionConstants.INVALID_USER_ID, { userId: id }),
                undefined,
                UserService.name,
            );
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        const result = await this.userRepository.delete(id);

        if (!result.affected) {
            this.logger.error(
                formatLogMessage('USDUse002', ExceptionConstants.USER_NOT_FOUND, { userId: id }),
                undefined,
                UserService.name,
            );
            throw new NotFoundException(ExceptionConstants.USER_NOT_FOUND);
        }

        return result;
    }
}

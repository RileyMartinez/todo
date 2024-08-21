import { BadRequestException, Inject, Injectable, LoggerService, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { ExceptionConstants } from 'src/common/constants/exception.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ValidationService } from 'src/common/services/validaton.service';

@Injectable()
export class UsersService {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        private readonly validationService: ValidationService,
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
        return await User.save({ ...createUserDto });
    }

    /**
     * Finds a user by their ID.
     *
     * @param id - The ID of the user to find.
     * @returns A promise that resolves to the found user.
     * @throws {BadRequestException} If the user ID is less than 1.
     */
    async findUserById(id: number): Promise<User> {
        if (!id || id < 1) {
            this.logger.error(ExceptionConstants.invalidUserId(id), UsersService.name);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        return await User.findOneByOrFail({ id });
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
            this.logger.error('User email cannot be empty or undefined', UsersService.name);
            throw new BadRequestException(ExceptionConstants.INVALID_EMAIL);
        }

        return await User.findOneBy({ email });
    }

    /**
     * Updates the refresh token of a user.
     *
     * @param id - The ID of the user.
     * @param refreshToken - The new refresh token.
     * @returns A promise that resolves to an UpdateResult object.
     * @throws {BadRequestException} If the user ID is invalid or the token is invalid.
     * @throws {NotFoundException} If the user is not found.
     */
    async updateUserRefreshToken(id: number, refreshToken: string): Promise<number> {
        if (!id || id < 1) {
            this.logger.error(ExceptionConstants.invalidUserId(id), UsersService.name);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        if (!refreshToken) {
            this.logger.error('Refresh token cannot be empty or undefined', UsersService.name);
            throw new BadRequestException(ExceptionConstants.INVALID_TOKEN);
        }

        const result = await User.update(id, { refreshToken });

        if (!result.affected) {
            this.logger.error(ExceptionConstants.userNotFound(id), UsersService.name);
            throw new NotFoundException(ExceptionConstants.userNotFound(id));
        }

        return result.affected;
    }

    /**
     * Clears the refresh token of a user.
     *
     * @param id - The ID of the user.
     * @returns A promise that resolves to an UpdateResult object.
     * @throws {BadRequestException} if the provided user ID is invalid.
     * @throws {NotFoundException} if the user is not found.
     */
    async clearUserRefreshToken(id: number): Promise<number> {
        if (!id || id < 1) {
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        const result = await User.update(id, { refreshToken: null });

        if (!result.affected) {
            this.logger.error(ExceptionConstants.userNotFound(id), UsersService.name);
            throw new NotFoundException(ExceptionConstants.userNotFound(id));
        }

        return result.affected;
    }

    /**
     * Removes a user.
     *
     * @param id - The ID of the user to remove.
     * @returns A promise that resolves to the number of deleted rows.
     * @throws {BadRequestException} If the user ID is less than 1.
     * @throws {NotFoundException} If the user to delete is not found.
     */
    async deleteUser(id: number): Promise<number> {
        if (!id || id < 1) {
            this.logger.error(ExceptionConstants.invalidUserId(id), UsersService.name);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        const result = await User.delete(id);

        if (!result.affected) {
            this.logger.error(ExceptionConstants.userNotFound(id), UsersService.name);
            throw new NotFoundException(ExceptionConstants.userNotFound(id));
        }

        return result.affected;
    }
}

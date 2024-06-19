import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { ClassValidatorUtil } from 'src/utils/class-validator.util';
import { ExceptionConstants } from 'src/constants/exception.constants';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {
        this.usersRepository = usersRepository;
    }

    /**
     * Creates a new user.
     * @param createUserDto - The data for creating a new user.
     * @returns A promise that resolves to the created user.
     * @throws {ValidationException} If user email or password is invalid.
     * @throws {InternalServerErrorException} If the user creation fails.
     */
    async create(createUserDto: CreateUserDto): Promise<User> {
        await ClassValidatorUtil.validate(createUserDto);
        return await this.usersRepository.insert(createUserDto);
    }

    /**
     * Finds a user by their ID.
     * @param id - The ID of the user to find.
     * @returns A promise that resolves to the found user.
     * @throws {BadRequestException} If the user ID is less than 1.
     * @throws {NotFoundException} If the user is not found.
     */
    async findOneById(id: number): Promise<User> {
        if (!id || id < 1) {
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        return await this.usersRepository.getOneById(id);
    }

    /**
     * Finds a user by their email.
     * @param email - The email of the user to find.
     * @returns A promise that resolves to the found user, or null if not found.
     * @throws {BadRequestException} If the email is not provided.
     */
    async findOneByEmail(email: string): Promise<User | null> {
        if (!email) {
            throw new BadRequestException(ExceptionConstants.INVALID_EMAIL);
        }

        return await this.usersRepository.getOneByEmail(email);
    }

    /**
     * Updates a user.
     * @param id - The ID of the user to update.
     * @param updateUserDto - The data for updating the user.
     * @returns A promise that resolves to the update result.
     * @throws {BadRequestException} If the user ID is less than 1, or if no fields are provided to update.
     * @throws {NotFoundException} If the user to update is not found.
     */
    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        if (!id || id < 1) {
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        if (!updateUserDto.password && !updateUserDto.refreshToken) {
            throw new BadRequestException('At least one field must be provided to update user');
        }

        return await this.usersRepository.update(id, updateUserDto);
    }

    /**
     * Nullifies the refresh token of a user.
     * @param id - The ID of the user.
     * @returns A Promise that resolves to the updated User object.
     * @throws {BadRequestException} If the user ID is less than 1.
     */
    async nullifyUserRefreshToken(id: number): Promise<User> {
        if (!id || id < 1) {
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        return await this.usersRepository.nullifyUserRefreshToken(id);
    }

    /**
     * Removes a user.
     * @param id - The ID of the user to remove.
     * @returns A promise that resolves to the number of deleted rows.
     * @throws {BadRequestException} If the user ID is less than 1.
     * @throws {NotFoundException} If the user to delete is not found.
     */
    async remove(id: number) {
        if (!id || id < 1) {
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        return await this.usersRepository.delete(id);
    }
}

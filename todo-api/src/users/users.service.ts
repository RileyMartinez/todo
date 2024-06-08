import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { strict as assert } from 'assert';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {
        this.usersRepository = usersRepository;
    }

    /**
     * Creates a new user.
     * @param createUserDto - The data for creating a new user.
     * @returns A promise that resolves to the created user.
     * @throws {AssertionError} If the CreateUserDto is not provided.
     * @throws {InternalServerErrorException} If the user creation fails.
     */
    async create(createUserDto: CreateUserDto): Promise<User> {
        assert(createUserDto, 'CreateUserDto must be provided');
        return await this.usersRepository.insert(createUserDto);
    }

    /**
     * Finds a user by their ID.
     * @param id - The ID of the user to find.
     * @returns A promise that resolves to the found user.
     * @throws {AssertionError} If the user ID is not provided.
     * @throws {NotFoundException} If the user is not found.
     */
    async findOneById(id: number): Promise<User> {
        assert(id > 0, 'User ID must be greater than 0');
        return await this.usersRepository.getOneById(id);
    }

    /**
     * Finds a user by their email.
     * @param email - The email of the user to find.
     * @returns A promise that resolves to the found user, or null if not found.
     * @throws {AssertionError} If the email is not provided.
     */
    async findOneByEmail(email: string): Promise<User | null> {
        assert(email, 'Email must be provided');
        return await this.usersRepository.getOneByEmail(email);
    }

    /**
     * Updates a user.
     * @param id - The ID of the user to update.
     * @param updateUserDto - The data for updating the user.
     * @returns A promise that resolves to the update result.
     * @throws {AssertionError} If the user ID is not provided, or if the password or refresh token is not provided.
     * @throws {NotFoundException} If the user to update is not found.
     */
    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        assert(id > 0, 'User ID must be greater than 0');
        assert(
            updateUserDto.password || updateUserDto.refreshToken,
            'At least one field must be provided to update user',
        );

        return await this.usersRepository.update(id, updateUserDto);
    }

    /**
     * Removes a user.
     * @param id - The ID of the user to remove.
     * @returns A promise that resolves to the number of deleted rows.
     * @throws {AssertionError} If the user ID is not provided.
     * @throws {NotFoundException} If the user to delete is not found.
     */
    async remove(id: number) {
        assert(id > 0, 'User ID must be greater than 0');
        return await this.usersRepository.delete(id);
    }
}

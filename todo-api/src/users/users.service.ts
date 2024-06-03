import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {
        this.usersRepository = usersRepository;
    }

    /**
     * Creates a new user.
     * @param createUserDto - The data for creating a new user.
     * @returns A promise that resolves to the created user.
     * @throws {InternalServerErrorException} If the user creation fails.
     */
    async create(createUserDto: CreateUserDto): Promise<User> {
        return await this.usersRepository.insert(createUserDto);
    }

    /**
     * Finds a user by their ID.
     * @param id - The ID of the user to find.
     * @returns A promise that resolves to the found user.
     * @throws {NotFoundException} If the user is not found.
     */
    async findOneById(id: number): Promise<User> {
        return await this.usersRepository.getOneById(id);
    }

    /**
     * Finds a user by their email.
     * @param email - The email of the user to find.
     * @returns A promise that resolves to the found user, or null if not found.
     */
    async findOneByEmail(email: string): Promise<User | null> {
        return await this.usersRepository.getOneByEmail(email);
    }

    /**
     * Updates a user.
     * @param id - The ID of the user to update.
     * @param updateUserDto - The data for updating the user.
     * @returns A promise that resolves to the update result.
     * @throws {NotFoundException} If the user to update is not found.
     */
    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        return await this.usersRepository.update(id, updateUserDto);
    }

    /**
     * Removes a user.
     * @param id - The ID of the user to remove.
     * @returns A promise that resolves to the number of deleted rows.
     * @throws {NotFoundException} If the user to delete is not found.
     */
    async remove(id: number) {
        return await this.usersRepository.delete(id);
    }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SafeUserDto } from './dto/safe-user.dto';
import { DatabaseException } from 'src/exceptions/database/database.exception';

@Injectable()
export class UsersRepository {
    constructor(
        @InjectRepository(User)
        private repository: Repository<User>,
    ) {}

    /**
     * Inserts a new user into the database.
     * @param insertUserDto - The data for creating a new user.
     * @returns A Promise that resolves to the created user.
     * @throws {DatabaseException} If the user creation fails.
     */
    async insert(insertUserDto: CreateUserDto): Promise<SafeUserDto> {
        const result = await this.repository
            .createQueryBuilder()
            .insert()
            .into(User)
            .values(insertUserDto)
            .returning(['id', 'email'])
            .execute();

        if (!result.raw[0]) {
            throw new DatabaseException('Failed to create user');
        }

        return result.raw[0];
    }

    /**
     * Retrieves a user by their ID.
     * @param id - The ID of the user to retrieve.
     * @returns A Promise that resolves to the user object if found, or null if not found.
     */
    async getOneById(id: number): Promise<User | null> {
        return await this.repository.createQueryBuilder().where('id = :id', { id }).getOne();
    }

    /**
     * Retrieves a user by their email.
     * @param email - The email of the user to retrieve.
     * @returns A Promise that resolves to the user object if found, or null if not found.
     */
    async getOneByEmail(email: string): Promise<User | null> {
        return await this.repository.createQueryBuilder().where('email = :email', { email }).getOne();
    }

    /**
     * Updates a user in the repository.
     *
     * @param id - The ID of the user to update.
     * @param updateUserDto - The data to update the user with.
     * @returns A promise that resolves to an object containing the update result.
     */
    async update(id: number, updateUserDto: UpdateUserDto): Promise<UpdateResult> {
        return await this.repository
            .createQueryBuilder()
            .update()
            .set(updateUserDto)
            .where('id = :id', { id })
            .execute();
    }

    /**
     * Deletes a user by their ID.
     * @param id - The ID of the user to delete.
     * @returns A promise that resolves to a `DeleteResult` object.
     */
    async delete(id: number): Promise<DeleteResult> {
        return await this.repository.createQueryBuilder().delete().where('id = :id', { id }).execute();
    }
}

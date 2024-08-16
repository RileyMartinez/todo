import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ExceptionConstants } from 'src/common/constants/exception.constants';

@Injectable()
export class UsersRepository {
    constructor(
        @InjectRepository(User)
        private repository: Repository<User>,
    ) {
        this.repository = repository;
    }

    /**
     * Inserts a new user into the database.
     * @param insertUserDto - The data for creating a new user.
     * @returns A Promise that resolves to the created user entity.
     * @throws {InternalServerErrorException} If the user creation fails.
     */
    async insert(insertUserDto: CreateUserDto): Promise<User> {
        const result = await this.repository
            .createQueryBuilder()
            .insert()
            .into(User)
            .values(insertUserDto)
            .returning('*')
            .execute();

        if (!result.raw[0]) {
            throw new InternalServerErrorException(`Failed to create user: ${JSON.stringify(insertUserDto)}`);
        }

        return result.raw[0];
    }

    /**
     * Retrieves a user by their ID.
     * @param id - The ID of the user to retrieve.
     * @returns A Promise that resolves to the user.
     * @throws {NotFoundException} If the user is not found.
     */
    async getOneById(id: number): Promise<User> {
        const result = await this.repository.createQueryBuilder().where('id = :id', { id }).getOne();

        if (!result) {
            throw new NotFoundException(ExceptionConstants.UserNotFound(id));
        }

        return result;
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
     * @returns A promise that resolves to the updated user entity.
     * @throws {NotFoundException} If the user to update is not found.
     */
    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const result = await this.repository
            .createQueryBuilder()
            .update()
            .set(updateUserDto)
            .where('id = :id', { id })
            .returning('*')
            .execute();

        if (!result.raw[0]) {
            throw new NotFoundException(ExceptionConstants.UserNotFound(id));
        }

        return result.raw[0];
    }

    /**
     * Nullifies the refresh token of a user with the specified ID.
     * @param id - The ID of the user.
     * @returns A Promise that resolves to the updated User object.
     * @throws {NotFoundException} If the user with the specified ID is not found.
     */
    async nullifyUserRefreshToken(id: number): Promise<User> {
        const result = await this.repository
            .createQueryBuilder()
            .update()
            .set({ refreshToken: null })
            .where('id = :id AND refreshToken IS NOT NULL', { id })
            .returning('*')
            .execute();

        return result.raw[0];
    }

    /**
     * Deletes a user by their ID.
     * @param id - The ID of the user to delete.
     * @returns A promise that resolves to the number of deleted rows.
     * @throws {NotFoundException} If the user to delete is not found.
     */
    async delete(id: number): Promise<number> {
        const result = await this.repository.createQueryBuilder().delete().where('id = :id', { id }).execute();

        if (!result.affected) {
            throw new NotFoundException(ExceptionConstants.UserNotFound(id));
        }

        return result.affected;
    }
}

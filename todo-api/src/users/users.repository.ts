import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
    constructor(
        @InjectRepository(User)
        private repository: Repository<User>,
    ) {}

    async insert(createUserDto: CreateUserDto): Promise<InsertResult> {
        return await this.repository
            .createQueryBuilder()
            .insert()
            .into(User)
            .values(createUserDto)
            .execute();
    }

    async getOneById(id: number): Promise<User | null> {
        return await this.repository
            .createQueryBuilder()
            .where('id = :id', { id })
            .getOne();
    }

    async getOneByUsername(username: string): Promise<User | null> {
        return await this.repository
            .createQueryBuilder()
            .where('username = :username', { username })
            .getOne();
    }

    async update(
        id: number,
        updateUserDto: UpdateUserDto,
    ): Promise<UpdateResult> {
        return await this.repository
            .createQueryBuilder()
            .update()
            .set(updateUserDto)
            .where('id = :id', { id })
            .execute();
    }

    async delete(id: number): Promise<DeleteResult> {
        return await this.repository
            .createQueryBuilder()
            .delete()
            .where('id = :id', { id })
            .execute();
    }
}

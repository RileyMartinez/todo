import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { InsertResult, UpdateResult } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(private usersRepository: UsersRepository) {}

    async create(createUserDto: CreateUserDto): Promise<InsertResult> {
        return await this.usersRepository.upsert(createUserDto);
    }

    async findOneById(id: number): Promise<User | null> {
        const user = await this.usersRepository.getOneById(id);
        return user;
    }

    async findOneByUsername(username: string): Promise<User | null> {
        const user = await this.usersRepository.getOneByUsername(username);
        return user;
    }

    async update(
        id: number,
        updateUserDto: UpdateUserDto,
    ): Promise<UpdateResult> {
        return await this.usersRepository.update(id, updateUserDto);
    }

    async remove(id: number) {
        return await this.usersRepository.delete(id);
    }
}

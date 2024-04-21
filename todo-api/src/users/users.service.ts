import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { InsertResult, UpdateResult } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private usersRepository: UsersRepository) {}

    async create(createUserDto: CreateUserDto): Promise<InsertResult> {
        const salt = await bcrypt.genSalt();
        createUserDto.password = await bcrypt.hash(
            createUserDto.password,
            salt,
        );

        return await this.usersRepository.insert(createUserDto);
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
        if (updateUserDto.password) {
            const salt = await bcrypt.genSalt();
            updateUserDto.password = await bcrypt.hash(
                updateUserDto.password,
                salt,
            );
        }

        return await this.usersRepository.update(id, updateUserDto);
    }

    async remove(id: number) {
        return await this.usersRepository.delete(id);
    }
}

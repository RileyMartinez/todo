import { Injectable } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { SafeUserDto } from './dto/safe-user.dto';
import { IUsersService } from './interfaces/users.interface';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class SafeUsersService implements IUsersService<SafeUserDto> {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly mapper: Mapper,
    ) {
        this.usersRepository = usersRepository;
        this.mapper = mapper;
    }

    async create(createUserDto: CreateUserDto): Promise<SafeUserDto> {
        const user = await this.usersRepository.insert(createUserDto);
        return this.mapper.map(user, User, SafeUserDto);
    }

    async findOneById(id: number): Promise<SafeUserDto | null> {
        const user = await this.usersRepository.getOneById(id);
        return user ? this.mapper.map(user, User, SafeUserDto) : null;
    }
}

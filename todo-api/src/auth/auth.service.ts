import { Injectable, NotImplementedException } from '@nestjs/common';
import { AuthLoginDto } from './dto/auth-login.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SafeUserDto } from 'src/users/dto/safe-user.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { InsertResult } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async validate({ username, password }: AuthLoginDto) {
        const user = await this.usersService.findOneByUsername(username);

        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return null;
        }

        const safeUser: SafeUserDto = SafeUserDto.createFromEntity(user);
        return await this.jwtService.signAsync(safeUser);
    }

    async register({
        username,
        password,
    }: AuthRegisterDto): Promise<InsertResult | null> {
        const user = await this.usersService.findOneByUsername(username);

        if (user) {
            return null;
        }

        return await this.usersService.create({
            username,
            password,
        });
    }

    async logout() {
        throw new NotImplementedException();
    }
}

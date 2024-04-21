import { Injectable } from '@nestjs/common';
import { AuthLoginDto } from './dto/auth-login.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SafeUserDto } from 'src/users/dto/safe-user.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';

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

        if (password !== user.password) {
            return null;
        }

        const safeUser: SafeUserDto = SafeUserDto.createFromEntity(user);

        return await this.jwtService.signAsync(safeUser);
    }

    async logout() {}

    async register({ username, password }: AuthRegisterDto) {
        const user = await this.usersService.findOneByUsername(username);

        if (user) {
            return null;
        }

        return await this.usersService.create({
            username,
            password,
        });
    }
}

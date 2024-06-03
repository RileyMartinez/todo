import { ConflictException, ForbiddenException, Injectable, NotImplementedException } from '@nestjs/common';
import { AuthLoginDto } from './dto/auth-login.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthRegisterDto } from './dto/auth-register.dto';
import * as bcrypt from 'bcrypt';
import { ConfigConstants } from 'src/constants/config.constants';
import { ConfigService } from '@nestjs/config';
import { AuthTokenDto } from './dto/auth-token.dto';
import { SafeUserDto } from 'src/users/dto/safe-user.dto';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectMapper()
        private readonly mapper: Mapper,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        this.mapper = mapper;
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
    }

    /**
     * Authenticates a user by checking their email and password.
     * If the user is authenticated, a JWT token is generated and returned.
     * @param {AuthLoginDto} credentials - The email and password of the user.
     * @returns {Promise<AuthTokenDto | null>} - A promise that resolves to the authentication tokens for the authenticated user.
     */
    async login({ email, password }: AuthLoginDto): Promise<AuthTokenDto> {
        const user = await this.usersService.findOneByEmail(email);
        const exceptionMessage = 'Access denied. Invalid email or password.';

        if (!user) {
            throw new ForbiddenException(exceptionMessage);
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            throw new ForbiddenException(exceptionMessage);
        }

        const safeUser = this.mapper.map(user, User, SafeUserDto);
        const tokens = await this.getTokens(safeUser);
        await this.updateUserRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    /**
     * Registers a new user with the provided email and password.
     * @param {AuthRegisterDto} data - The registration data containing email and password.
     * @returns {Promise<AuthTokenDto>} - A promise that resolves to the authentication tokens for the registered user, or null if registration fails.
     * @throws {ConflictException} - If a user with the provided email already exists.
     */
    async register({ email, password }: AuthRegisterDto): Promise<AuthTokenDto> {
        const user = await this.usersService.findOneByEmail(email);

        if (user) {
            throw new ConflictException(`User with email ${email} already exists`);
        }

        const saltRounds = Number(this.configService.getOrThrow(ConfigConstants.BCRYPT_SALT_ROUNDS));
        const hash = await bcrypt.hash(password, saltRounds);

        const newUser = await this.usersService.create({
            email,
            password: hash,
        });

        const tokens = await this.getTokens(newUser);
        await this.updateUserRefreshToken(newUser.id, tokens.refreshToken);

        return tokens;
    }

    async logout() {
        throw new NotImplementedException();
    }

    /**
     * Generates access and refresh tokens for a given user.
     * @param userId - The ID of the user.
     * @param email - The email of the user.
     * @returns An object containing the access and refresh tokens.
     */
    private async getTokens(safeUser: SafeUserDto): Promise<{ accessToken: string; refreshToken: string }> {
        const accessTokenSecret = this.configService.getOrThrow(ConfigConstants.JWT_SECRET);
        const refreshTokenSecret = this.configService.getOrThrow(ConfigConstants.JWT_REFRESH_SECRET);
        const accessTokenExpiration = this.configService.getOrThrow(ConfigConstants.JWT_EXPIRATION);
        const refreshTokenExpiration = this.configService.getOrThrow(ConfigConstants.JWT_REFRESH_EXPIRATION);

        const [accessToken, refreshToken] = await Promise.all([
            await this.jwtService.signAsync(
                {
                    userId: safeUser.id,
                    email: safeUser.email,
                },
                {
                    secret: accessTokenSecret,
                    expiresIn: accessTokenExpiration,
                },
            ),
            await this.jwtService.signAsync(
                {
                    userId: safeUser.id,
                    email: safeUser.email,
                },
                {
                    secret: refreshTokenSecret,
                    expiresIn: refreshTokenExpiration,
                },
            ),
        ]);

        return { accessToken, refreshToken };
    }

    /**
     * Updates the refresh token for a user.
     * @param userId - The ID of the user.
     * @param refreshToken - The new refresh token.
     * @returns A Promise that resolves when the refresh token is updated.
     */
    private async updateUserRefreshToken(userId: number, refreshToken: string): Promise<void> {
        const saltRounds = Number(this.configService.getOrThrow(ConfigConstants.BCRYPT_SALT_ROUNDS));
        const hash = await bcrypt.hash(refreshToken, saltRounds);

        await this.usersService.update(userId, { refreshToken: hash });
    }
}

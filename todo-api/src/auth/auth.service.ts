import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Inject,
    Injectable,
    LoggerService,
} from '@nestjs/common';
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
import { ExceptionConstants } from 'src/constants/exception.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ClassValidator } from 'src/utils/class-validator.util';
import { AuthRefreshDto } from './dto/auth-refresh.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectMapper() private readonly mapper: Mapper,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        this.mapper = mapper;
        this.logger = logger;
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
    }

    /**
     * Authenticates a user by checking their email and password.
     * If the user is authenticated, a JWT token is generated and returned.
     * @param {AuthLoginDto} credentials - The email and password of the user.
     * @returns {Promise<AuthTokenDto>} - A promise that resolves to the authentication tokens for the authenticated user.
     * @throws {ValidationException} - If the email or password is invalid.
     * @throws {ForbiddenException} - If the email or password is incorrect.
     */
    async login(authLoginDto: AuthLoginDto): Promise<AuthTokenDto> {
        await ClassValidator.validate(authLoginDto);

        const user = await this.usersService.findOneByEmail(authLoginDto.email);

        if (!user) {
            this.logger.warn(`User with email ${authLoginDto.email} not found`, AuthService.name);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const passwordMatches = await bcrypt.compare(authLoginDto.password, user.password);

        if (!passwordMatches) {
            this.logger.warn(`Password for user with email ${authLoginDto.email} does not match`, AuthService.name);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const safeUser = this.mapper.map(user, User, SafeUserDto);
        const tokens = await this.getTokens(safeUser);

        await this.updateUserRefreshToken(new AuthRefreshDto(safeUser.id, tokens.refreshToken));

        return tokens;
    }

    /**
     * Registers a new user with the provided email and password.
     * @param {AuthRegisterDto} data - The registration data containing email and password.
     * @returns {Promise<AuthTokenDto>} - A promise that resolves to the authentication tokens for the registered user, or null if registration fails.
     * @throws {ValidationException} - If the email or password is invalid.
     * @throws {ConflictException} - If a user with the provided email already exists.
     */
    async register(authRegisterDto: AuthRegisterDto): Promise<AuthTokenDto> {
        await ClassValidator.validate(authRegisterDto);

        const user = await this.usersService.findOneByEmail(authRegisterDto.email);

        if (user) {
            this.logger.warn(`User with email ${authRegisterDto.email} already exists`, AuthService.name);
            throw new ConflictException(ExceptionConstants.USER_ALREADY_EXISTS);
        }

        const saltRounds = Number(this.configService.getOrThrow(ConfigConstants.BCRYPT_SALT_ROUNDS));
        const hash = await bcrypt.hash(authRegisterDto.password, saltRounds);

        const newUser = await this.usersService.create({
            email: authRegisterDto.email,
            password: hash,
        });

        const safeNewUser = this.mapper.map(newUser, User, SafeUserDto);
        const tokens = await this.getTokens(safeNewUser);
        await this.updateUserRefreshToken(new AuthRefreshDto(safeNewUser.id, tokens.refreshToken));

        return tokens;
    }

    /**
     * Logs out a user by nullifying their refresh token.
     * @param userId - The ID of the user to log out.
     * @throws {BadRequestException} If user ID is less than 1.
     */
    async logout(userId: number): Promise<void> {
        if (userId < 1) {
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        await this.usersService.nullifyUserRefreshToken(userId);
    }

    /**
     * Refreshes the authentication tokens for a user.
     *
     * @param userId - The ID of the user.
     * @param refreshToken - The refresh token provided by the user.
     * @returns A promise that resolves to an AuthTokenDto object containing the new authentication tokens.
     * @throws {ValidationException} if the user ID or refresh token is invalid.
     * @throws {ForbiddenException} if the user is not found, does not have a refresh token, or if the provided refresh token does not match.
     */
    async refresh(authRefreshDto: AuthRefreshDto): Promise<AuthTokenDto> {
        await ClassValidator.validate(authRefreshDto);

        const user = await this.usersService.findOneById(authRefreshDto.userId);

        if (!user) {
            this.logger.warn(`User with ID ${authRefreshDto.userId} not found`, AuthService.name);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        if (!user.refreshToken) {
            this.logger.warn(`User with ID ${authRefreshDto.userId} does not have a refresh token`, AuthService.name);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const refreshTokenMatches = await bcrypt.compare(authRefreshDto.refreshToken, user.refreshToken);

        if (!refreshTokenMatches) {
            this.logger.warn(
                `Refresh token for user with ID ${authRefreshDto.userId} does not match`,
                AuthService.name,
            );
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const safeUser = this.mapper.map(user, User, SafeUserDto);
        const tokens = await this.getTokens(safeUser);

        await this.updateUserRefreshToken(new AuthRefreshDto(safeUser.id, tokens.refreshToken));

        return tokens;
    }

    /**
     * Generates access and refresh tokens for a given user.
     * @param userId - The ID of the user.
     * @param email - The email of the user.
     * @returns An object containing the access and refresh tokens.
     * @throws {ValidationException} If the user ID or email is invalid.
     */
    private async getTokens(safeUser: SafeUserDto): Promise<AuthTokenDto> {
        await ClassValidator.validate(safeUser);

        const accessTokenSecret = this.configService.getOrThrow(ConfigConstants.JWT_SECRET);
        const refreshTokenSecret = this.configService.getOrThrow(ConfigConstants.JWT_REFRESH_SECRET);
        const accessTokenExpiration = this.configService.getOrThrow(ConfigConstants.JWT_EXPIRATION);
        const refreshTokenExpiration = this.configService.getOrThrow(ConfigConstants.JWT_REFRESH_EXPIRATION);

        const [accessToken, refreshToken] = await Promise.all([
            await this.jwtService.signAsync(
                {
                    sub: safeUser.id,
                    email: safeUser.email,
                },
                {
                    secret: accessTokenSecret,
                    expiresIn: accessTokenExpiration,
                },
            ),
            await this.jwtService.signAsync(
                {
                    sub: safeUser.id,
                    email: safeUser.email,
                },
                {
                    secret: refreshTokenSecret,
                    expiresIn: refreshTokenExpiration,
                },
            ),
        ]);

        const tokens = new AuthTokenDto(accessToken, refreshToken);
        await ClassValidator.validate(tokens);

        return tokens;
    }

    /**
     * Updates the refresh token for a user.
     * @param userId - The ID of the user.
     * @param refreshToken - The new refresh token.
     * @returns A Promise that resolves when the refresh token is updated.
     * @throws {ValidationException} If the user ID or refresh token is invalid.
     */
    private async updateUserRefreshToken(authRefreshDto: AuthRefreshDto): Promise<void> {
        await ClassValidator.validate(authRefreshDto);

        const saltRounds = Number(this.configService.getOrThrow(ConfigConstants.BCRYPT_SALT_ROUNDS));
        const hash = await bcrypt.hash(authRefreshDto.refreshToken, saltRounds);

        await this.usersService.update(authRefreshDto.userId, { refreshToken: hash });
    }
}

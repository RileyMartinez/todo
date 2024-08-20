import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Inject,
    Injectable,
    LoggerService,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigConstants } from 'src/common/constants/config.constants';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/modules/users/entities/user.entity';
import { ExceptionConstants } from 'src/common/constants/exception.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ValidatorUtil } from 'src/utils/validator.util';
import { AuthLoginDto, AuthTokenDto, AuthRefreshDto } from './dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import * as argon2 from 'argon2';
import { argon2HashConfig } from 'src/common/configs';

@Injectable()
export class AuthService {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        this.logger = logger;
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
    }

    /**
     * Authenticates a user by checking their email and password.
     * If the user is authenticated, a JWT token is generated and returned.
     *
     * @param {AuthLoginDto} authLoginDto - The email and password of the user.
     * @returns {Promise<AuthTokenDto>} - A promise that resolves to the authentication tokens for the authenticated user.
     * @throws {ValidationException} - If the email or password is invalid.
     * @throws {ForbiddenException} - If the email or password is incorrect.
     */
    async login(authLoginDto: AuthLoginDto): Promise<AuthTokenDto> {
        await ValidatorUtil.validate(authLoginDto);

        const user = await this.usersService.findOneByEmail(authLoginDto.email);

        if (!user) {
            this.logger.error(`User with email ${authLoginDto.email} not found`, AuthService.name);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const match = await argon2.verify(user.password, authLoginDto.password);

        if (!match) {
            this.logger.error(`Password for user with email ${authLoginDto.email} does not match`, AuthService.name);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const tokens = await this.getTokens(user);
        await this.updateUserRefreshToken(new AuthRefreshDto(user.id, tokens.refreshToken));

        return tokens;
    }

    /**
     * Registers a new user with the provided email and password.
     *
     * @param {AuthRegisterDto} authRegisterDto - The registration data containing email and password.
     * @returns {Promise<AuthTokenDto>} - A promise that resolves to the authentication tokens for the registered user, or null if registration fails.
     * @throws {ValidationException} - If the email or password is invalid.
     * @throws {ConflictException} - If a user with the provided email already exists.
     */
    async register(authRegisterDto: AuthRegisterDto): Promise<AuthTokenDto> {
        await ValidatorUtil.validate(authRegisterDto);

        const user = await this.usersService.findOneByEmail(authRegisterDto.email);

        if (user) {
            this.logger.error(`User with email ${authRegisterDto.email} already exists`, AuthService.name);
            throw new ConflictException(ExceptionConstants.USER_ALREADY_EXISTS);
        }

        const hash = await argon2.hash(authRegisterDto.password, argon2HashConfig);

        const newUser = await this.usersService.create({
            email: authRegisterDto.email,
            password: hash,
        });

        const tokens = await this.getTokens(newUser);
        await this.updateUserRefreshToken(new AuthRefreshDto(newUser.id, tokens.refreshToken));

        return tokens;
    }

    /**
     * Logs out a user by nullifying their refresh token.
     *
     * @param userId - The ID of the user to log out.
     * @throws {BadRequestException} If user ID is less than 1.
     */
    async logout(userId: number): Promise<void> {
        if (userId < 1) {
            this.logger.error(ExceptionConstants.InvalidUserId(userId), AuthService.name);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        await this.usersService.nullifyUserRefreshToken(userId);
    }

    /**
     * Refreshes the authentication tokens for a user.
     *
     * @param {AuthRefreshDto} authRefreshDto - The user ID and refresh token.
     * @returns A promise that resolves to an AuthTokenDto object containing the new authentication tokens.
     * @throws {ValidationException} if the user ID or refresh token is invalid.
     * @throws {ForbiddenException} if the user is not found, does not have a refresh token, or if the provided refresh token does not match.
     */
    async refresh(authRefreshDto: AuthRefreshDto): Promise<AuthTokenDto> {
        await ValidatorUtil.validate(authRefreshDto);

        const user = await this.usersService.findOneById(authRefreshDto.userId);

        if (!user) {
            this.logger.error(ExceptionConstants.UserNotFound(authRefreshDto.userId), AuthService.name);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        if (!user.refreshToken) {
            this.logger.error(`User with ID ${authRefreshDto.userId} does not have a refresh token`, AuthService.name);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const match = await argon2.verify(user.refreshToken, authRefreshDto.refreshToken);

        if (!match) {
            this.logger.error(
                `Refresh token for user with ID ${authRefreshDto.userId} does not match`,
                AuthService.name,
            );
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const tokens = await this.getTokens(user);
        await this.updateUserRefreshToken(new AuthRefreshDto(user.id, tokens.refreshToken));

        return tokens;
    }

    /**
     * Generates access and refresh tokens for a given user.
     *
     * @param {User} user - The user for which to generate tokens.
     * @returns An object containing the access and refresh tokens.
     * @throws {ValidationException} If the user ID or email is invalid.
     */
    private async getTokens(user: User): Promise<AuthTokenDto> {
        await ValidatorUtil.validate(user);

        const accessTokenSecret = this.configService.getOrThrow(ConfigConstants.JWT_SECRET);
        const refreshTokenSecret = this.configService.getOrThrow(ConfigConstants.JWT_REFRESH_SECRET);
        const accessTokenExpiration = this.configService.getOrThrow(ConfigConstants.JWT_EXPIRATION);
        const refreshTokenExpiration = this.configService.getOrThrow(ConfigConstants.JWT_REFRESH_EXPIRATION);

        const [accessToken, refreshToken] = await Promise.all([
            await this.jwtService.signAsync(
                {
                    sub: user.id,
                    email: user.email,
                },
                {
                    secret: accessTokenSecret,
                    expiresIn: accessTokenExpiration,
                },
            ),
            await this.jwtService.signAsync(
                {
                    sub: user.id,
                },
                {
                    secret: refreshTokenSecret,
                    expiresIn: refreshTokenExpiration,
                },
            ),
        ]);

        const tokens = new AuthTokenDto(accessToken, refreshToken);
        await ValidatorUtil.validate(tokens);

        return tokens;
    }

    /**
     * Updates the refresh token for a user.
     *
     * @param {AuthRefreshDto} authRefreshDto - The user ID and refresh token.
     * @returns A Promise that resolves when the refresh token is updated.
     * @throws {ValidationException} If the user ID or refresh token is invalid.
     */
    private async updateUserRefreshToken(authRefreshDto: AuthRefreshDto): Promise<void> {
        await ValidatorUtil.validate(authRefreshDto);
        const hash = await argon2.hash(authRefreshDto.refreshToken, argon2HashConfig);
        await this.usersService.update(authRefreshDto.userId, { refreshToken: hash });
    }
}

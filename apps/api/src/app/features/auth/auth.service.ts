import { argon2HashConfig } from '@/app/core/configs/argon2-hash.config';
import { ConfigConstants } from '@/app/core/constants/config.constants';
import { ExceptionConstants } from '@/app/core/constants/exception.constants';
import { EncryptionUtil } from '@/app/core/utils/encryption.util';
import { User } from '@/app/features/user/entities/user.entity';
import { UserService } from '@/app/features/user/user.service';
import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { validateOrReject, ValidationError } from 'class-validator';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthLoginRequestDto } from './dto/auth-login-request.dto';
import { AuthLoginResultDto } from './dto/auth-login-result.dto';
import { AuthRefreshRequestDto } from './dto/auth-refresh-request.dto';
import { AuthRefreshResultDto } from './dto/auth-refresh-result.dto';
import { AuthRegisterRequestDto } from './dto/auth-register-request.dto';
import { AuthRegisterResultDto } from './dto/auth-register-result.dto';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { OtpTokenDto } from './dto/otp-token.dto';
import { PasswordlessLoginDto } from './dto/passwordless-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserContextDto } from './dto/user-context.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usersService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly encryptionUtil: EncryptionUtil,
    ) {}

    /**
     * Authenticates a user by checking their email and password.
     * If the user is authenticated, JWT tokens are issued.
     *
     * @param {AuthLoginRequestDto} authLoginRequestDto - The email and password of the user.
     * @returns {Promise<AuthLoginResultDto>} - Auth tokens and user context.
     * @throws {ValidationError} - If the email or password is invalid.
     * @throws {ForbiddenException} - If the email or password is incorrect.
     */
    async login(authLoginRequestDto: AuthLoginRequestDto): Promise<AuthLoginResultDto> {
        await validateOrReject(authLoginRequestDto);

        const user = await this.usersService.findUserByEmail(authLoginRequestDto.email);

        if (!user) {
            this.logger.error({ email: authLoginRequestDto.email }, ExceptionConstants.USER_NOT_FOUND);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        if (!user.password) {
            this.logger.error({ user }, 'Password from db cannot be null or undefined');
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const match = await argon2.verify(user.password, authLoginRequestDto.password);

        if (!match) {
            this.logger.error({ user }, 'Password does not match');
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const tokens = await this.issueTokens(user);
        await this.updateUserRefreshToken(new AuthRefreshRequestDto(user.id, tokens.refreshToken));

        return new AuthLoginResultDto(tokens, UserContextDto.from(user));
    }

    /**
     * Performs a one-time login for the user.
     *
     * @param authLoginRequestDto - The authentication login DTO.
     * @returns {Promise<AuthLoginResultDto>} - Auth tokens and user context.
     * @throws {ValidationError} If the email or password is invalid.
     * @throws {ForbiddenException} If the user is not found, does not have a token, token is expired, or if the provided token does not match.
     */
    async oneTimeLogin(authLoginRequestDto: AuthLoginRequestDto): Promise<AuthLoginResultDto> {
        await validateOrReject(authLoginRequestDto);

        const user = await this.usersService.findUserByEmail(authLoginRequestDto.email);

        if (!user) {
            this.logger.error({ email: authLoginRequestDto.email }, ExceptionConstants.USER_NOT_FOUND);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        if (!user.token) {
            this.logger.error({ user }, ExceptionConstants.INVALID_TOKEN);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const decryptedToken = this.encryptionUtil.decrypt(user.token);
        let verifiedToken: OtpTokenDto;

        try {
            verifiedToken = this.jwtService.verify<OtpTokenDto>(decryptedToken, {
                secret: this.configService.getOrThrow<string>(ConfigConstants.JWT_SECRET),
            });
        } catch (error) {
            this.logger.error({ user, error }, ExceptionConstants.INVALID_TOKEN);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        if (verifiedToken.otp.toString() !== authLoginRequestDto.password) {
            this.logger.error({ user }, 'OTP does not match');
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const tokens = await this.issueTokens(user);
        await this.updateUserRefreshToken(new AuthRefreshRequestDto(user.id, tokens.refreshToken));

        return new AuthLoginResultDto(tokens, UserContextDto.from(user));
    }

    /**
     * Registers a new user with the provided email and password.
     *
     * @param {AuthRegisterRequestDto} authRegisterRequestDto - The registration data containing email and password.
     * @returns {Promise<AuthTokensDto>} - A promise that resolves to the authentication tokens for the registered user, or null if registration fails.
     * @throws {ValidationError} - If the email or password is invalid.
     * @throws {ConflictException} - If a user with the provided email already exists.
     */
    async register(authRegisterRequestDto: AuthRegisterRequestDto): Promise<AuthRegisterResultDto> {
        await validateOrReject(authRegisterRequestDto);

        const user = await this.usersService.findUserByEmail(authRegisterRequestDto.email);

        if (user) {
            this.logger.warn({ user }, ExceptionConstants.USER_ALREADY_EXISTS);
            throw new ConflictException(ExceptionConstants.USER_ALREADY_EXISTS);
        }

        const hash = await argon2.hash(authRegisterRequestDto.password, argon2HashConfig);

        const newUser = await this.usersService.createUser({
            email: authRegisterRequestDto.email,
            password: hash,
        });

        const tokens = await this.issueTokens(newUser);
        await this.updateUserRefreshToken(new AuthRefreshRequestDto(newUser.id, tokens.refreshToken));

        return new AuthRegisterResultDto(tokens, UserContextDto.from(newUser));
    }

    /**
     * Logs in an existing user or registers a new user if they do not exist.
     * Primarily used for passwordless single-sign-on (SSO) scenarios.
     *
     * @param {PasswordlessLoginDto} passwordlessLoginDto - The passwordless login DTO containing the email and avatar.
     * @returns {Promise<AuthLoginResultDto>} A promise that resolves to the authentication tokens for the user..
     * @throws {ValidationError} - If the email or password is invalid.
     * @throws {ForbiddenException} - If the provided password does not match the stored password for an existing user.
     */
    async passwordlessLoginOrRegister(passwordlessLoginDto: PasswordlessLoginDto): Promise<AuthLoginResultDto> {
        await validateOrReject(passwordlessLoginDto);
        const { email, avatar } = passwordlessLoginDto;

        let user = await this.usersService.findUserByEmail(email);

        if (!user) {
            const password = this.encryptionUtil.generatePassword();
            const hash = await argon2.hash(password, argon2HashConfig);
            user = await this.usersService.createUser(new CreateUserDto(email, hash, avatar));
        } else if (!user.avatar && avatar) {
            await this.usersService.updateUserAvatar(user.id, avatar);
        }

        const tokens = await this.issueTokens(user);
        await this.updateUserRefreshToken(new AuthRefreshRequestDto(user.id, tokens.refreshToken));

        return new AuthLoginResultDto(tokens, UserContextDto.from(user));
    }

    /**
     * Logs out a user by nullifying their refresh token.
     *
     * @param userId - The ID of the user to log out.
     * @throws {BadRequestException} If user ID is less than 1.
     */
    async logout(userId: string): Promise<void> {
        if (!userId) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_USER_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        await this.usersService.revokeUserToken(userId);
    }

    /**
     * Refreshes the authentication tokens for a user.
     *
     * @param {AuthRefreshRequestDto} authRefreshRequest - The user ID and refresh token.
     * @returns {Promise<AuthRefreshResultDto>} - A promise that resolves to the new access token and user context.
     * @throws {ValidationError} if the user ID or refresh token is invalid.
     * @throws {ForbiddenException} if the user is not found, does not have a refresh token, or if the provided refresh token does not match.
     */
    async refresh(authRefreshRequest: AuthRefreshRequestDto): Promise<AuthRefreshResultDto> {
        await validateOrReject(authRefreshRequest);

        const user = await this.usersService.findUserById(authRefreshRequest.userId);

        if (!user) {
            this.logger.error({ authRefreshRequest }, ExceptionConstants.USER_NOT_FOUND);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        if (!user.token) {
            this.logger.error({ user }, ExceptionConstants.INVALID_TOKEN);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        let verifiedToken: RefreshTokenDto;

        try {
            verifiedToken = this.jwtService.verify<RefreshTokenDto>(user.token, {
                secret: this.configService.getOrThrow<string>(ConfigConstants.JWT_REFRESH_SECRET),
            });
        } catch (error) {
            this.logger.error({ user, error }, ExceptionConstants.INVALID_TOKEN);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const match = verifiedToken?.sub === user.id && verifiedToken?.version === user.tokenVersion;

        if (!match) {
            this.logger.error({ user }, 'Refresh token does not match');
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const token = await this.issueAccessToken(user);

        return new AuthRefreshResultDto(token, UserContextDto.from(user));
    }

    /**
     * Generates access and refresh tokens for a given user.
     *
     * @param {User} user - The user for which to generate tokens.
     * @returns An object containing the access and refresh tokens.
     * @throws {ValidationError} If the user ID or email is invalid.
     */
    private async issueTokens(user: User): Promise<AuthTokensDto> {
        await validateOrReject(user);

        const accessTokenSecret = this.configService.getOrThrow(ConfigConstants.JWT_SECRET);
        const refreshTokenSecret = this.configService.getOrThrow(ConfigConstants.JWT_REFRESH_SECRET);
        const accessTokenExpiration = this.configService.getOrThrow(ConfigConstants.JWT_EXPIRATION);
        const refreshTokenExpiration = this.configService.getOrThrow(ConfigConstants.JWT_REFRESH_EXPIRATION);

        const [accessToken, refreshToken] = await Promise.all([
            await this.jwtService.signAsync(
                {
                    sub: user.id,
                },
                {
                    secret: accessTokenSecret,
                    expiresIn: accessTokenExpiration,
                },
            ),
            await this.jwtService.signAsync(
                {
                    sub: user.id,
                    version: user.tokenVersion + 1,
                },
                {
                    secret: refreshTokenSecret,
                    expiresIn: refreshTokenExpiration,
                },
            ),
        ]);

        return new AuthTokensDto(accessToken, refreshToken);
    }

    /**
     * Generates an access token for the given user.
     *
     * @param user - The user object for which to generate the access token.
     * @returns A promise that resolves to an AccessTokenResponseDto containing the generated access token.
     */
    private async issueAccessToken(user: User): Promise<string> {
        await validateOrReject(user);

        const accessTokenSecret = this.configService.getOrThrow(ConfigConstants.JWT_SECRET);
        const accessTokenExpiration = this.configService.getOrThrow(ConfigConstants.JWT_EXPIRATION);

        const accessToken = await this.jwtService.signAsync(
            {
                sub: user.id,
            },
            {
                secret: accessTokenSecret,
                expiresIn: accessTokenExpiration,
            },
        );

        return accessToken;
    }

    /**
     * Updates the refresh token for a user.
     *
     * @param {AuthRefreshRequestDto} authRefreshRequestDto - The user ID and refresh token.
     * @returns A Promise that resolves when the refresh token is updated.
     * @throws {ValidationError} If the user ID or refresh token is invalid.
     */
    private async updateUserRefreshToken(authRefreshRequestDto: AuthRefreshRequestDto): Promise<void> {
        await validateOrReject(authRefreshRequestDto);
        await this.usersService.updateUserToken(authRefreshRequestDto.userId, authRefreshRequestDto.refreshToken);
    }
}

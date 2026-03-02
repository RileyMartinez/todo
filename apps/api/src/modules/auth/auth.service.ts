import { argon2HashConfig } from '@/config/argon2-hash.config';
import { AuthCredentialsDto } from '@/modules/auth/dto/auth-credentials.dto';
import { AuthRefreshResultDto } from '@/modules/auth/dto/auth-refresh-result.dto';
import { AuthResultDto } from '@/modules/auth/dto/auth-result.dto';
import { AuthTokensDto } from '@/modules/auth/dto/auth-tokens.dto';
import { OtpTokenPayloadDto } from '@/modules/auth/dto/otp-token-payload.dto';
import { RefreshTokenPayloadDto } from '@/modules/auth/dto/refresh-token-payload.dto';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { User } from '@/modules/user/entities/user.entity';
import { UserProfileService } from '@/modules/user/user-profile.service';
import { UserTokenService } from '@/modules/user/user-token.service';
import { UserService } from '@/modules/user/user.service';
import { ConfigConstants } from '@/shared/constants/config.constants';
import { ExceptionConstants } from '@/shared/constants/exception.constants';
import { EncryptionUtil } from '@/shared/utils/encryption.util';
import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { validateOrReject } from 'class-validator';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usersService: UserService,
        private readonly userTokenService: UserTokenService,
        private readonly userProfileService: UserProfileService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly encryptionUtil: EncryptionUtil,
    ) {}

    /**
     * Authenticates a user by checking their email and password.
     * If the user is authenticated, JWT tokens are issued.
     *
     * @param {AuthCredentialsDto} credentials - The email and password of the user.
     * @returns {Promise<AuthResult>} - Auth tokens and user context.
     * @throws {ForbiddenException} - If the email or password is incorrect.
     */
    async login(credentials: AuthCredentialsDto): Promise<AuthResultDto> {
        const user = await this.usersService.findUserByEmail(credentials.email);

        if (!user) {
            this.logger.error({ email: credentials.email }, ExceptionConstants.USER_NOT_FOUND);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        if (!user.password) {
            this.logger.error({ user }, 'Password from db cannot be null or undefined');
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const match = await argon2.verify(user.password, credentials.password);

        if (!match) {
            this.logger.error({ user }, 'Password does not match');
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const tokens = await this.issueTokens(user);
        await this.userTokenService.updateUserToken(user.id, tokens.refreshToken);

        const result = new AuthResultDto(tokens, user.toUserContextDto());
        await validateOrReject(result);
        return result;
    }

    /**
     * Performs a one-time login for the user.
     *
     * @param credentials - The authentication credentials.
     * @returns {Promise<AuthResult>} - Auth tokens and user context.
     * @throws {ForbiddenException} If the user is not found, does not have a token, token is expired, or if the provided token does not match.
     */
    async oneTimeLogin(credentials: AuthCredentialsDto): Promise<AuthResultDto> {
        const user = await this.usersService.findUserByEmail(credentials.email);

        if (!user) {
            this.logger.error({ email: credentials.email }, ExceptionConstants.USER_NOT_FOUND);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        if (!user.token) {
            this.logger.error({ user }, ExceptionConstants.INVALID_TOKEN);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const decryptedToken = this.encryptionUtil.decrypt(user.token);
        let verifiedToken: OtpTokenPayloadDto;

        try {
            const payload = this.jwtService.verify(decryptedToken, {
                secret: this.configService.getOrThrow<string>(ConfigConstants.JWT_SECRET),
            });
            verifiedToken = new OtpTokenPayloadDto(payload.otp);
            await validateOrReject(verifiedToken);
        } catch (error) {
            this.logger.error({ user, error }, ExceptionConstants.INVALID_TOKEN);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        if (verifiedToken.otp.toString() !== credentials.password) {
            this.logger.error({ user }, 'OTP does not match');
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const tokens = await this.issueTokens(user);
        await this.userTokenService.updateUserToken(user.id, tokens.refreshToken);

        const result = new AuthResultDto(tokens, user.toUserContextDto());
        await validateOrReject(result);
        return result;
    }

    /**
     * Registers a new user with the provided email and password.
     *
     * @param {AuthCredentialsDto} credentials - The registration data containing email and password.
     * @returns {Promise<AuthResult>} - A promise that resolves to the auth tokens and user context for the registered user.
     * @throws {ConflictException} - If a user with the provided email already exists.
     */
    async register(credentials: AuthCredentialsDto): Promise<AuthResultDto> {
        const user = await this.usersService.findUserByEmail(credentials.email);

        if (user) {
            this.logger.warn({ user }, ExceptionConstants.USER_ALREADY_EXISTS);
            throw new ConflictException(ExceptionConstants.USER_ALREADY_EXISTS);
        }

        const hash = await argon2.hash(credentials.password, argon2HashConfig);

        const newUser = await this.usersService.createUser(new CreateUserDto(credentials.email, hash));

        const tokens = await this.issueTokens(newUser);
        await this.userTokenService.updateUserToken(newUser.id, tokens.refreshToken);

        const result = new AuthResultDto(tokens, newUser.toUserContextDto());
        await validateOrReject(result);
        return result;
    }

    /**
     * Logs in an existing user or registers a new user if they do not exist.
     * Primarily used for passwordless single-sign-on (SSO) scenarios.
     *
     * @param email - The user's email address.
     * @param avatar - Optional avatar URL.
     * @returns {Promise<AuthResult>} A promise that resolves to the auth tokens and user context.
     * @throws {ForbiddenException} - If the provided password does not match the stored password for an existing user.
     */
    async passwordlessLoginOrRegister(email: string, avatar?: string): Promise<AuthResultDto> {
        let user = await this.usersService.findUserByEmail(email);

        if (!user) {
            const password = this.encryptionUtil.generatePassword();
            const hash = await argon2.hash(password, argon2HashConfig);
            user = await this.usersService.createUser(new CreateUserDto(email, hash, avatar));
        } else if (!user.avatar && avatar) {
            await this.userProfileService.updateUserAvatar(user.id, avatar);
        }

        const tokens = await this.issueTokens(user);
        await this.userTokenService.updateUserToken(user.id, tokens.refreshToken);

        const result = new AuthResultDto(tokens, user.toUserContextDto());
        await validateOrReject(result);
        return result;
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

        await this.userTokenService.revokeUserToken(userId);
    }

    /**
     * Refreshes the authentication tokens for a user.
     *
     * @param userId - The user ID.
     * @param refreshToken - The current refresh token.
     * @returns {Promise<AuthRefreshResult>} - A promise that resolves to the new access token and user context.
     * @throws {ForbiddenException} if the user is not found, does not have a refresh token, or if the provided refresh token does not match.
     */
    async refresh(userId: string, refreshToken: string): Promise<AuthRefreshResultDto> {
        const user = await this.usersService.findUserById(userId);

        if (!user) {
            this.logger.error({ userId }, ExceptionConstants.USER_NOT_FOUND);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        if (!user.token) {
            this.logger.error({ user }, ExceptionConstants.INVALID_TOKEN);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        let verifiedToken: RefreshTokenPayloadDto;

        try {
            const payload = this.jwtService.verify(user.token, {
                secret: this.configService.getOrThrow<string>(ConfigConstants.JWT_REFRESH_SECRET),
            });
            verifiedToken = new RefreshTokenPayloadDto(payload.sub, payload.version);
            await validateOrReject(verifiedToken);
        } catch (error) {
            this.logger.error({ user, error }, ExceptionConstants.INVALID_TOKEN);
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const match = verifiedToken?.sub === user.id && verifiedToken?.version === user.tokenVersion;

        if (!match) {
            this.logger.error({ user }, 'Refresh token does not match');
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const accessToken = await this.issueAccessToken(user);

        const result = new AuthRefreshResultDto(accessToken, user.toUserContextDto());
        await validateOrReject(result);
        return result;
    }

    /**
     * Generates access and refresh tokens for a given user.
     *
     * @param {User} user - The user for which to generate tokens.
     * @returns An object containing the access and refresh tokens.
     */
    private async issueTokens(user: User): Promise<AuthTokensDto> {
        const accessTokenSecret = this.configService.getOrThrow(ConfigConstants.JWT_SECRET);
        const refreshTokenSecret = this.configService.getOrThrow(ConfigConstants.JWT_REFRESH_SECRET);
        const accessTokenExpiration = this.configService.getOrThrow(ConfigConstants.JWT_EXPIRATION);
        const refreshTokenExpiration = this.configService.getOrThrow(ConfigConstants.JWT_REFRESH_EXPIRATION);

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: user.id,
                },
                {
                    secret: accessTokenSecret,
                    expiresIn: accessTokenExpiration,
                },
            ),
            this.jwtService.signAsync(
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

        const tokens = new AuthTokensDto(accessToken, refreshToken);
        await validateOrReject(tokens);
        return tokens;
    }

    /**
     * Generates an access token for the given user.
     *
     * @param user - The user object for which to generate the access token.
     * @returns A promise that resolves to the generated access token string.
     */
    private async issueAccessToken(user: User): Promise<string> {
        const accessTokenSecret = this.configService.getOrThrow(ConfigConstants.JWT_SECRET);
        const accessTokenExpiration = this.configService.getOrThrow(ConfigConstants.JWT_EXPIRATION);

        return await this.jwtService.signAsync(
            {
                sub: user.id,
            },
            {
                secret: accessTokenSecret,
                expiresIn: accessTokenExpiration,
            },
        );
    }
}

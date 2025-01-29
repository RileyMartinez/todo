import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Inject,
    Injectable,
    LoggerService,
} from '@nestjs/common';
import { UserService } from 'src/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigConstants } from 'src/common/constants/config.constants';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/modules/users/entities/user.entity';
import { ExceptionConstants } from 'src/common/constants/exception.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
    AccessTokenResponseDto,
    AuthLoginRequestDto,
    AuthRefreshRequestDto,
    AuthTokensDto,
    RawOtpTokenDto,
    RawRefreshTokenDto,
} from './dto';
import { AuthRegisterRequestDto } from './dto/auth-register-request.dto';
import { ValidationUtil } from '@/common/utils/validaton.util';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventConstants, PasswordResetEvent } from '@/common';
import { formatLogMessage } from '@/common/utils/logger.util';
import { argon2HashConfig } from 'src/common/configs';
import * as argon2 from 'argon2';
import { randomInt } from 'crypto';
import { EncryptionUtil } from '@/common/utils/encryption.util';

@Injectable()
export class AuthService {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        private readonly usersService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly validationUtil: ValidationUtil,
        private readonly encryptionUtil: EncryptionUtil,
        private readonly eventEmitter: EventEmitter2,
    ) {
        this.logger = logger;
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.validationUtil = validationUtil;
        this.encryptionUtil = encryptionUtil;
        this.eventEmitter = eventEmitter;
    }

    /**
     * Authenticates a user by checking their email and password.
     * If the user is authenticated, a JWT token is generated and returned.
     *
     * @param {AuthLoginRequestDto} login - The email and password of the user.
     * @returns {Promise<AuthTokensDto>} - A promise that resolves to the authentication tokens for the authenticated user.
     * @throws {ValidationException} - If the email or password is invalid.
     * @throws {ForbiddenException} - If the email or password is incorrect.
     */
    async login(login: AuthLoginRequestDto): Promise<AuthTokensDto> {
        await this.validationUtil.validateObject(login);

        const user = await this.usersService.findUserByEmail(login.email);

        if (!user) {
            this.logger.error(
                formatLogMessage('ASLog001', ExceptionConstants.USER_NOT_FOUND, { email: login.email }),
                undefined,
                AuthService.name,
            );
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const match = await argon2.verify(user.password, login.password);

        if (!match) {
            this.logger.error(
                formatLogMessage('ASLog002', 'Password does not match', { userId: user.id }),
                undefined,
                AuthService.name,
            );
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const tokens = await this.issueTokens(user);
        await this.updateUserRefreshToken(new AuthRefreshRequestDto(user.id, tokens.refreshToken));

        return tokens;
    }

    /**
     * Performs a one-time login for the user.
     *
     * @param login - The authentication login data transfer object.
     * @returns A promise that resolves to an AuthTokenDto.
     * @throws {ValidationException} If the email or password is invalid.
     * @throws {ForbiddenException} If the user is not found, does not have a token, token is expired, or if the provided token does not match.
     */
    async oneTimeLogin(login: AuthLoginRequestDto): Promise<AuthTokensDto> {
        await this.validationUtil.validateObject(login);

        const user = await this.usersService.findUserByEmail(login.email);

        if (!user) {
            this.logger.error(
                formatLogMessage('ASOTLog001', ExceptionConstants.USER_NOT_FOUND, { email: login.email }),
                undefined,
                AuthService.name,
            );
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        if (!user.token) {
            this.logger.error(
                formatLogMessage('ASOTLog002', ExceptionConstants.INVALID_TOKEN, { userId: user.id }),
                undefined,
                AuthService.name,
            );
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const decryptedToken = this.encryptionUtil.decrypt(user.token);
        let verifiedToken: RawOtpTokenDto;

        try {
            verifiedToken = this.jwtService.verify<RawOtpTokenDto>(decryptedToken, {
                secret: this.configService.getOrThrow<string>(ConfigConstants.JWT_SECRET),
            });
        } catch (error) {
            const stack = error instanceof Error ? error.stack : ExceptionConstants.UNKNOWN_ERROR;
            this.logger.error(
                formatLogMessage('ASOTLog003', ExceptionConstants.INVALID_TOKEN, { userId: user.id }),
                stack,
                AuthService.name,
            );
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        if (verifiedToken?.otp.toString() !== login.password) {
            this.logger.error(
                formatLogMessage('ASOTLog004', 'OTP does not match', { userId: user.id }),
                undefined,
                AuthService.name,
            );
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const tokens = await this.issueTokens(user);
        await this.updateUserRefreshToken(new AuthRefreshRequestDto(user.id, tokens.refreshToken));

        return tokens;
    }

    /**
     * Registers a new user with the provided email and password.
     *
     * @param {AuthRegisterRequestDto} registration - The registration data containing email and password.
     * @returns {Promise<AuthTokensDto>} - A promise that resolves to the authentication tokens for the registered user, or null if registration fails.
     * @throws {ValidationException} - If the email or password is invalid.
     * @throws {ConflictException} - If a user with the provided email already exists.
     */
    async register(registration: AuthRegisterRequestDto): Promise<AuthTokensDto> {
        await this.validationUtil.validateObject(registration);

        const user = await this.usersService.findUserByEmail(registration.email);

        if (user) {
            this.logger.warn(
                formatLogMessage('ASReg001', ExceptionConstants.USER_ALREADY_EXISTS, {
                    userId: user.id,
                    email: user.email,
                }),
                AuthService.name,
            );
            throw new ConflictException(ExceptionConstants.USER_ALREADY_EXISTS);
        }

        const hash = await argon2.hash(registration.password, argon2HashConfig);

        const newUser = await this.usersService.createUser({
            email: registration.email,
            password: hash,
        });

        const tokens = await this.issueTokens(newUser);
        await this.updateUserRefreshToken(new AuthRefreshRequestDto(newUser.id, tokens.refreshToken));

        return tokens;
    }

    /**
     * Logs in an existing user or registers a new user if they do not exist.
     * Primarily used for single-sign-on (SSO) scenarios.
     *
     * @param {AuthLoginRequestDto} login - The login/registration data containing email and password.
     * @returns {Promise<AuthTokensDto>} - A promise that resolves to the authentication tokens for the user..
     * @throws {ValidationException} - If the email or password is invalid.
     * @throws {ForbiddenException} - If the provided password does not match the stored password for an existing user.
     */
    async loginOrRegister(login: AuthLoginRequestDto): Promise<AuthTokensDto> {
        await this.validationUtil.validateObject(login);

        let user = await this.usersService.findUserByEmail(login.email);

        if (!user) {
            const hash = await argon2.hash(login.password, argon2HashConfig);

            user = await this.usersService.createUser({
                email: login.email,
                password: hash,
            });
        } else {
            const match = await argon2.verify(user.password, login.password);

            if (!match) {
                this.logger.error(
                    formatLogMessage('ASLOR001', 'Password does not match', { userId: user.id }),
                    undefined,
                    AuthService.name,
                );
                throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
            }
        }

        const tokens = await this.issueTokens(user);
        await this.updateUserRefreshToken(new AuthRefreshRequestDto(user.id, tokens.refreshToken));

        return tokens;
    }

    /**
     * Logs out a user by nullifying their refresh token.
     *
     * @param userId - The ID of the user to log out.
     * @throws {BadRequestException} If user ID is less than 1.
     */
    async logout(userId: string): Promise<void> {
        if (!userId) {
            this.logger.error(
                formatLogMessage('ASLog001', ExceptionConstants.INVALID_USER_ID, { userId }),
                undefined,
                AuthService.name,
            );
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        await this.usersService.revokeUserToken(userId);
    }

    /**
     * Refreshes the authentication tokens for a user.
     *
     * @param {AuthRefreshRequestDto} authRefreshRequestDto - The user ID and refresh token.
     * @returns A promise that resolves to an AuthTokenDto object containing the new authentication tokens.
     * @throws {ValidationException} if the user ID or refresh token is invalid.
     * @throws {ForbiddenException} if the user is not found, does not have a refresh token, or if the provided refresh token does not match.
     */
    async refresh(authRefreshRequestDto: AuthRefreshRequestDto): Promise<AccessTokenResponseDto> {
        await this.validationUtil.validateObject(authRefreshRequestDto);

        const user = await this.usersService.findUserById(authRefreshRequestDto.userId);

        if (!user) {
            this.logger.error(
                formatLogMessage('ASRef001', ExceptionConstants.USER_NOT_FOUND, {
                    userId: authRefreshRequestDto.userId,
                }),
                undefined,
                AuthService.name,
            );
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        if (!user.token) {
            this.logger.error(
                formatLogMessage('ASRef002', ExceptionConstants.INVALID_TOKEN, { userId: user.id }),
                undefined,
                AuthService.name,
            );
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        let verifiedToken: RawRefreshTokenDto;

        try {
            verifiedToken = this.jwtService.verify<RawRefreshTokenDto>(user.token, {
                secret: this.configService.getOrThrow<string>(ConfigConstants.JWT_REFRESH_SECRET),
            });
        } catch (error) {
            const stack = error instanceof Error ? error.stack : ExceptionConstants.UNKNOWN_ERROR;
            this.logger.error(
                formatLogMessage('ASRef002', ExceptionConstants.INVALID_TOKEN, { userId: user.id }),
                stack,
                AuthService.name,
            );
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const match = verifiedToken?.sub === user.id && verifiedToken?.version === user.tokenVersion;

        if (!match) {
            this.logger.error(
                formatLogMessage('ASRef003', 'Refresh token does not match', { userId: user.id }),
                undefined,
                AuthService.name,
            );
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        return await this.issueAccessToken(user);
    }

    /**
     * Sends a password reset event for the given email.
     *
     * @remarks We intentionally do not provide feedback if the email does not exist to prevent user enumeration.
     *
     * @param email - The email of the user.
     * @returns A promise that resolves to void.
     */
    async sendPasswordResetEvent(email: string): Promise<void> {
        if (!email) {
            this.logger.error(
                formatLogMessage('ASSPREve001', ExceptionConstants.INVALID_EMAIL, { email }),
                undefined,
                AuthService.name,
            );
            throw new BadRequestException(ExceptionConstants.INVALID_EMAIL);
        }

        const user = await this.usersService.findUserByEmail(email);

        if (!user) {
            this.logger.warn(
                formatLogMessage('ASSPREve002', ExceptionConstants.USER_NOT_FOUND, { email }),
                AuthService.name,
            );
            return;
        }

        const token = await this.jwtService.signAsync(
            {
                email: user.email,
                otp: randomInt(100000, 999999),
            },
            {
                secret: this.configService.getOrThrow(ConfigConstants.JWT_SECRET),
                expiresIn: this.configService.getOrThrow(ConfigConstants.JWT_EXPIRATION),
            },
        );

        const encryptedToken = this.encryptionUtil.encrypt(token);
        await this.usersService.revokeUserToken(user.id);
        await this.usersService.updateUserToken(user.id, encryptedToken);

        this.eventEmitter.emit(EventConstants.PASSWORD_RESET, new PasswordResetEvent(token));
    }

    /**
     * Generates access and refresh tokens for a given user.
     *
     * @param {User} user - The user for which to generate tokens.
     * @returns An object containing the access and refresh tokens.
     * @throws {ValidationException} If the user ID or email is invalid.
     */
    private async issueTokens(user: User): Promise<AuthTokensDto> {
        await this.validationUtil.validateObject(user);

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
                    version: user.tokenVersion,
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
    private async issueAccessToken(user: User): Promise<AccessTokenResponseDto> {
        await this.validationUtil.validateObject(user);

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

        return new AccessTokenResponseDto(accessToken);
    }

    /**
     * Updates the refresh token for a user.
     *
     * @param {AuthRefreshRequestDto} authRefreshRequestDto - The user ID and refresh token.
     * @returns A Promise that resolves when the refresh token is updated.
     * @throws {ValidationException} If the user ID or refresh token is invalid.
     */
    private async updateUserRefreshToken(authRefreshRequestDto: AuthRefreshRequestDto): Promise<void> {
        await this.validationUtil.validateObject(authRefreshRequestDto);
        await this.usersService.updateUserToken(authRefreshRequestDto.userId, authRefreshRequestDto.refreshToken);
    }
}

import { DecoratorConstants } from '@/app/core/constants/decorator.constants';
import { ExceptionConstants } from '@/app/core/constants/exception.constants';
import { GetCurrentUser } from '@/app/core/decorators/get-current-user.decorator';
import { Public } from '@/app/core/decorators/public.decorator';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Post } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCookieAuth,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { DeleteResult } from 'typeorm';
import { PasswordResetRequestDto } from '../auth/dto/password-reset-request.dto';
import { UserContextDto } from '../auth/dto/user-context.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SafeUserDto } from './dto/safe-user.dto';
import { UpdateDisplayNameDto } from './dto/update-display-name.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { VerifyUserRequestDto } from './dto/verify-user-request.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('user')
@ApiCookieAuth()
export class UserController {
    constructor(private readonly userService: UserService) {}

    /**
     * Create a new user.
     */
    @Post()
    @ApiCreatedResponse({ type: SafeUserDto })
    async createUser(@Body() createUserDto: CreateUserDto): Promise<SafeUserDto> {
        const user = await this.userService.createUser(createUserDto);
        return new SafeUserDto(user);
    }

    /**
     * Remove a user by their ID.
     */
    @Delete()
    @ApiOkResponse({ type: Number, description: 'The number of users deleted' })
    @ApiNotFoundResponse({ description: ExceptionConstants.USER_NOT_FOUND })
    async deleteUser(@GetCurrentUser(DecoratorConstants.SUB) userId: string): Promise<DeleteResult> {
        return await this.userService.deleteUser(userId);
    }

    @Get('context')
    @ApiOkResponse({ type: UserContextDto })
    @ApiNotFoundResponse({ description: ExceptionConstants.USER_NOT_FOUND })
    async getUserContext(@GetCurrentUser(DecoratorConstants.SUB) userId: string): Promise<UserContextDto> {
        const user = await this.userService.findUserById(userId);
        return UserContextDto.from(user);
    }

    @Post('update-password')
    @ApiOkResponse({ description: 'Password updated successfully.' })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_USER_ID })
    @ApiNotFoundResponse({ description: ExceptionConstants.USER_NOT_FOUND })
    @HttpCode(HttpStatus.OK)
    async updatePassword(
        @GetCurrentUser(DecoratorConstants.SUB) userId: string,
        @Body() updatePasswordDto: UpdatePasswordDto,
    ): Promise<void> {
        await this.userService.updateUserPassword(userId, updatePasswordDto);
    }

    /**
     * Reset a user's password.
     */
    @Post('reset-password')
    @ApiOkResponse({ description: 'Password updated successfully.' })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_USER_ID })
    @ApiNotFoundResponse({ description: ExceptionConstants.USER_NOT_FOUND })
    @HttpCode(HttpStatus.OK)
    async resetPassword(
        @GetCurrentUser(DecoratorConstants.SUB) userId: string,
        @Body() resetPasswordDto: ResetPasswordDto,
    ): Promise<void> {
        await this.userService.resetUserPassword(userId, resetPasswordDto.password);
    }

    /**
     * Update a user's display name.
     */
    @Post('display-name')
    @ApiOkResponse({ description: 'Display name updated successfully.' })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_USER_ID })
    @ApiNotFoundResponse({ description: ExceptionConstants.USER_NOT_FOUND })
    @HttpCode(HttpStatus.OK)
    async updateDisplayName(
        @GetCurrentUser(DecoratorConstants.SUB) userId: string,
        @Body() updateDisplayNameDto: UpdateDisplayNameDto,
    ): Promise<void> {
        await this.userService.updateUserDisplayName(userId, updateDisplayNameDto.displayName);
    }

    /**
     * Verify a user's email.
     */
    @Post('verify')
    @ApiOkResponse({ type: UserContextDto })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_USER_ID })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_VERIFICATION_CODE })
    @HttpCode(HttpStatus.OK)
    async verifyUser(
        @GetCurrentUser(DecoratorConstants.SUB) userId: string,
        @Body() verifyUserRequestDto: VerifyUserRequestDto,
    ): Promise<UserContextDto> {
        return await this.userService.verifyUser(userId, verifyUserRequestDto.verificationCode);
    }

    /**
     *  Handles the account verification request.
     *
     * @param accountVerificationRequest - The email to send the account verification request to.
     */
    @Post('send-account-verification')
    @ApiOkResponse({ description: 'Account verification request sent successfully.' })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_USER_ID })
    @ApiNotFoundResponse({ description: ExceptionConstants.USER_NOT_FOUND })
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async sendAccountVerification(@GetCurrentUser(DecoratorConstants.SUB) userId: string): Promise<void> {
        return await this.userService.sendAccountVerificationMessage(userId);
    }

    /**
     * [Public]
     * Handles the password reset request.
     *
     * @param {string} passwordResetRequestDto - Email to send the password reset request to.
     */
    @Public()
    @Post('send-password-reset')
    @ApiOkResponse({ description: 'Password reset request sent successfully.' })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_EMAIL })
    @HttpCode(HttpStatus.OK)
    async sendPasswordResetRequest(@Body() passwordResetRequestDto: PasswordResetRequestDto): Promise<void> {
        return await this.userService.sendPasswordResetMessage(passwordResetRequestDto.email);
    }
}

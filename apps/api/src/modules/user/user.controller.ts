import { GetCurrentUser } from '@/common/decorators/get-current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { PasswordResetRequestDto } from '@/common/dto/password-reset-request.dto';
import { UserContextDto } from '@/common/dto/user-context.dto';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { ResetPasswordDto } from '@/modules/user/dto/reset-password.dto';
import { SafeUserDto } from '@/modules/user/dto/safe-user.dto';
import { UpdateDisplayNameDto } from '@/modules/user/dto/update-display-name.dto';
import { UpdatePasswordDto } from '@/modules/user/dto/update-password.dto';
import { VerifyUserRequestDto } from '@/modules/user/dto/verify-user-request.dto';
import { UserNotificationService } from '@/modules/user/user-notification.service';
import { UserProfileService } from '@/modules/user/user-profile.service';
import { UserService } from '@/modules/user/user.service';
import { DecoratorConstants } from '@/shared/constants/decorator.constants';
import { ExceptionConstants } from '@/shared/constants/exception.constants';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Post } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCookieAuth,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { DeleteResult } from 'typeorm';

@Controller('user')
@ApiTags('user')
@ApiCookieAuth()
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly userProfileService: UserProfileService,
        private readonly userNotificationService: UserNotificationService,
    ) {}

    /**
     * Create a new user.
     */
    @Post()
    @ApiCreatedResponse({ type: SafeUserDto })
    async createUser(@Body() createUserDto: CreateUserDto): Promise<SafeUserDto> {
        const user = await this.userService.createUser(createUserDto);
        return user.toSafeUserDto();
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

        if (!user) {
            throw new NotFoundException(ExceptionConstants.USER_NOT_FOUND);
        }

        return user.toUserContextDto();
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
        await this.userProfileService.updateUserDisplayName(userId, updateDisplayNameDto.displayName);
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
        return await this.userProfileService.verifyUser(userId, verifyUserRequestDto.verificationCode);
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
        return await this.userNotificationService.sendAccountVerificationMessage(userId);
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
        return await this.userNotificationService.sendPasswordResetMessage(passwordResetRequestDto.email);
    }
}

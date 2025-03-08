import { DecoratorConstants } from '@/app/core/constants/decorator.constants';
import { ExceptionConstants } from '@/app/core/constants/exception.constants';
import { GetCurrentUser } from '@/app/core/decorators/get-current-user.decorator';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCookieAuth,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { UserContextDto } from '../auth/dto/user-context.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { SafeUserDto } from './dto/safe-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { VerifyUserRequestDto } from './dto/verify-user-request.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('user')
@ApiCookieAuth()
export class UserController {
    constructor(private readonly userService: UserService) {
        this.userService = userService;
    }

    /**
     * Create a new user.
     */
    @Post()
    @ApiCreatedResponse({ type: SafeUserDto })
    async create(@Body() createUserDto: CreateUserDto): Promise<SafeUserDto> {
        const user = await this.userService.createUser(createUserDto);
        return new SafeUserDto(user);
    }

    /**
     * Remove a user by their ID.
     */
    @Delete()
    @ApiOkResponse({ type: Number, description: 'The number of users deleted' })
    @ApiNotFoundResponse({ description: ExceptionConstants.USER_NOT_FOUND })
    async remove(@GetCurrentUser(DecoratorConstants.SUB) userId: string): Promise<DeleteResult> {
        return await this.userService.deleteUser(userId);
    }

    @Get('context')
    @ApiOkResponse({ type: UserContextDto })
    @ApiNotFoundResponse({ description: ExceptionConstants.USER_NOT_FOUND })
    async getUserContext(@GetCurrentUser(DecoratorConstants.SUB) userId: string): Promise<UserContextDto> {
        const user = await this.userService.findUserById(userId);
        return UserContextDto.from(user);
    }

    /**
     * Update a user's password.
     */
    @Post('password')
    @ApiOkResponse({ description: 'Password updated successfully.' })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_USER_ID })
    @ApiNotFoundResponse({ description: ExceptionConstants.USER_NOT_FOUND })
    @HttpCode(HttpStatus.OK)
    async updatePassword(
        @GetCurrentUser(DecoratorConstants.SUB) userId: string,
        @Body() updatePasswordDto: UpdatePasswordDto,
    ): Promise<void> {
        await this.userService.updateUserPassword(userId, updatePasswordDto.password);
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
}

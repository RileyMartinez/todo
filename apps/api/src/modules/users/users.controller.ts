import { DecoratorConstants } from '@/common/constants/decorator.constants';
import { GetCurrentUser } from '@/common/decorators/get-current-user.decorator';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { ExceptionConstants } from 'src/common/constants/exception.constants';
import { DeleteResult, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { SafeUserDto } from './dto/safe-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserService } from './users.service';

@Controller('user')
@ApiTags('user')
@ApiBearerAuth()
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
     * Find a user by their ID.
     */
    @Get(':id')
    @ApiOkResponse({ type: SafeUserDto })
    @ApiNotFoundResponse({ description: ExceptionConstants.USER_NOT_FOUND })
    async findOneById(@Param('id') id: string): Promise<SafeUserDto> {
        const user = await this.userService.findUserById(id);
        return new SafeUserDto(user);
    }

    /**
     * Find a user by their email.
     */
    @Get('email/:email')
    @ApiOkResponse({ type: SafeUserDto })
    @ApiNotFoundResponse({ description: ExceptionConstants.USER_NOT_FOUND })
    async findOneByEmail(@Param('email') email: string): Promise<SafeUserDto | null> {
        const user = await this.userService.findUserByEmail(email);

        if (!user) {
            throw new NotFoundException(ExceptionConstants.USER_NOT_FOUND);
        }

        return new SafeUserDto(user);
    }

    /**
     * Remove a user by their ID.
     */
    @Delete(':id')
    @ApiOkResponse({ type: Number, description: 'The number of users deleted' })
    @ApiNotFoundResponse({ description: ExceptionConstants.USER_NOT_FOUND })
    async remove(@Param('id') id: string): Promise<DeleteResult> {
        return await this.userService.deleteUser(id);
    }

    @Post('password')
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'Password updated successfully.' })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @HttpCode(HttpStatus.OK)
    async updatePassword(
        @GetCurrentUser(DecoratorConstants.SUB) userId: string,
        @Body() updatePasswordDto: UpdatePasswordDto,
    ): Promise<UpdateResult> {
        return await this.userService.updateUserPassword(userId, updatePasswordDto);
    }
}

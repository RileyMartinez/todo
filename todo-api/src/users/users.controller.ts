import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    UseGuards,
    UseInterceptors,
    Res,
    HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { SafeUserDto } from './dto/safe-user.dto';
import { MapInterceptor } from '@automapper/nestjs';
import { User } from './entities/user.entity';
import { Response } from 'express';

@Controller('users')
@ApiTags('users')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) {
        this.usersService = usersService;
    }

    /**
     * Create a new user.
     */
    @Post()
    @ApiCreatedResponse({
        description: 'The created user',
        type: SafeUserDto,
    })
    @ApiInternalServerErrorResponse({
        description: 'Failed to create user',
    })
    @UseInterceptors(MapInterceptor(User, SafeUserDto))
    async create(@Body() createUserDto: CreateUserDto): Promise<SafeUserDto> {
        return this.usersService.create(createUserDto);
    }

    /**
     * Find a user by their ID.
     */
    @Get(':id')
    @ApiOkResponse({
        description: 'The found user',
        type: SafeUserDto,
    })
    @ApiNotFoundResponse({
        description: 'User with ID ${id} not found',
    })
    @UseInterceptors(MapInterceptor(User, SafeUserDto))
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<SafeUserDto> {
        return await this.usersService.findOneById(id);
    }

    /**
     * Find a user by their email.
     */
    @Get('email/:email')
    @ApiOkResponse({
        description: 'The found user',
        type: SafeUserDto,
    })
    @ApiNoContentResponse({
        description: 'User not found',
    })
    @UseInterceptors(MapInterceptor(User, SafeUserDto))
    async findOneByEmail(@Param('email') email: string, @Res() res: Response): Promise<SafeUserDto | null> {
        const user = await this.usersService.findOneByEmail(email);

        if (!user) {
            res.status(HttpStatus.NO_CONTENT).send();
        }

        return user;
    }

    /**
     * Update a user by their ID.
     */
    @Patch(':id')
    @ApiOkResponse({
        description: 'The updated user',
        type: SafeUserDto,
    })
    @ApiNotFoundResponse({
        description: 'User with ID ${id} not found',
    })
    @UseInterceptors(MapInterceptor(User, SafeUserDto))
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<SafeUserDto> {
        return this.usersService.update(id, updateUserDto);
    }

    /**
     * Remove a user by their ID.
     */
    @Delete(':id')
    @ApiOkResponse({
        description: 'The number of deleted users',
        type: Number,
    })
    @ApiNotFoundResponse({
        description: 'User with ID ${id} not found',
    })
    remove(@Param('id', ParseIntPipe) id: number): Promise<number> {
        return this.usersService.remove(id);
    }
}

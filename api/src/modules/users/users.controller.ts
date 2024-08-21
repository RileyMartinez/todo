import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    ParseIntPipe,
    UseInterceptors,
    NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SafeUserDto } from './dto/safe-user.dto';
import { MapInterceptor } from '@automapper/nestjs';
import { User } from './entities/user.entity';
import { ExceptionConstants } from 'src/common/constants/exception.constants';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) {
        this.usersService = usersService;
    }

    /**
     * Create a new user.
     */
    @Post()
    @ApiCreatedResponse({ type: SafeUserDto })
    @UseInterceptors(MapInterceptor(User, SafeUserDto))
    async create(@Body() createUserDto: CreateUserDto): Promise<SafeUserDto> {
        return this.usersService.createUser(createUserDto);
    }

    /**
     * Find a user by their ID.
     */
    @Get(':id')
    @ApiOkResponse({ type: SafeUserDto })
    @ApiNotFoundResponse({ description: ExceptionConstants.USER_NOT_FOUND })
    @UseInterceptors(MapInterceptor(User, SafeUserDto))
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<SafeUserDto> {
        return await this.usersService.findUserById(id);
    }

    /**
     * Find a user by their email.
     */
    @Get('email/:email')
    @ApiOkResponse({ type: SafeUserDto })
    @ApiNotFoundResponse({ description: ExceptionConstants.USER_NOT_FOUND })
    @UseInterceptors(MapInterceptor(User, SafeUserDto))
    async findOneByEmail(@Param('email') email: string): Promise<SafeUserDto | null> {
        const user = await this.usersService.findUserByEmail(email);

        if (!user) {
            throw new NotFoundException(ExceptionConstants.USER_NOT_FOUND);
        }

        return user;
    }

    /**
     * Remove a user by their ID.
     */
    @Delete(':id')
    @ApiOkResponse({ type: Number })
    @ApiNotFoundResponse({ description: ExceptionConstants.USER_NOT_FOUND })
    remove(@Param('id', ParseIntPipe) id: number): Promise<number> {
        return this.usersService.deleteUser(id);
    }
}

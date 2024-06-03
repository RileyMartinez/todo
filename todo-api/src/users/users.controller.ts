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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SafeUserDto } from './dto/safe-user.dto';
import { MapInterceptor } from '@automapper/nestjs';
import { User } from './entities/user.entity';

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
     * @param createUserDto - The data for creating a new user.
     * @returns The created user.
     */
    @Post()
    @UseInterceptors(MapInterceptor(User, SafeUserDto))
    async create(@Body() createUserDto: CreateUserDto): Promise<SafeUserDto> {
        return this.usersService.create(createUserDto);
    }

    /**
     * Find a user by their ID.
     * @param id - The ID of the user to find.
     * @returns The found user.
     */
    @Get(':id')
    @UseInterceptors(MapInterceptor(User, SafeUserDto))
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<SafeUserDto> {
        return await this.usersService.findOneById(id);
    }

    /**
     * Find a user by their email.
     * @param email - The email of the user to find.
     * @returns The found user.
     */
    @Get('email/:email')
    @UseInterceptors(MapInterceptor(User, SafeUserDto))
    async findOneByEmail(@Param('email') email: string): Promise<SafeUserDto | null> {
        return await this.usersService.findOneByEmail(email);
    }

    /**
     * Update a user by their ID.
     * @param id - The ID of the user to update.
     * @param updateUserDto - The data for updating the user.
     * @returns The updated user.
     */
    @Patch(':id')
    @UseInterceptors(MapInterceptor(User, SafeUserDto))
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<SafeUserDto> {
        return this.usersService.update(id, updateUserDto);
    }

    /**
     * Remove a user by their ID.
     * @param id - The ID of the user to remove.
     * @returns The removed user.
     */
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number): Promise<number> {
        return this.usersService.remove(id);
    }
}

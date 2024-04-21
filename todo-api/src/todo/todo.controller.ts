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
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('todo')
@UseGuards(JwtGuard)
@SkipThrottle()
export class TodoController {
    constructor(private readonly todoService: TodoService) {}

    @Post()
    async create(@Body() createTodoDto: CreateTodoDto): Promise<InsertResult> {
        return await this.todoService.create(createTodoDto);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<Todo | null> {
        return await this.todoService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTodoDto: UpdateTodoDto,
    ): Promise<UpdateResult> {
        return await this.todoService.update(id, updateTodoDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
        return await this.todoService.remove(id);
    }
}

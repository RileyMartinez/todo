import { ArrayMinSize, IsArray } from 'class-validator';
import { TodoListDto } from '@/modules/todo-list/dto/todo-list.dto';

export class TodoListsDto {
    @IsArray()
    @ArrayMinSize(1)
    todoLists: TodoListDto[] = [];
}

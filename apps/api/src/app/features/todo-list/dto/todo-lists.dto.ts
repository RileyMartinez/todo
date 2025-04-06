import { ArrayMinSize, IsArray } from 'class-validator';
import { TodoListDto } from './todo-list.dto';

export class TodoListsDto {
    @IsArray()
    @ArrayMinSize(1)
    todoLists: TodoListDto[] = [];
}

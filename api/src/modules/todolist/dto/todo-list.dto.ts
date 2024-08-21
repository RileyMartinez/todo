import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class TodoListDto {
    /**
     * Todo list id
     * @example 1
     */
    @IsNumber()
    @IsOptional()
    id?: number;

    /**
     * Todo list title
     * @example 'Grocery list'
     */
    @IsString()
    @IsNotEmpty()
    title: string = '';
}

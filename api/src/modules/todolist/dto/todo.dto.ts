import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class TodoDto {
    /**
     * Todo item id
     * @example 'a1b2c3d4-1234-5678-90ab-cdef12345678'
     */
    @IsString()
    @IsOptional()
    id?: string;

    /**
     * Todo item title
     * @example 'Buy milk'
     */
    @IsString()
    @IsNotEmpty()
    title: string = '';

    /**
     * Todo item description
     * @example '2% milk'
     */
    @IsString()
    @IsOptional()
    description?: string;

    /**
     * Todo item completion status
     * @example false
     */
    @IsBoolean()
    @IsNotEmpty()
    completed: boolean = false;

    /**
     * Todo item due date
     * @example 2021-12-31T23:59:59.999Z
     */
    @IsDate()
    @IsOptional()
    dueDate?: Date;

    /**
     * Todo item order
     * @example 1
     */
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    order: number = 0;

    /**
     * Todo list id
     * @example 1
     */
    @IsString()
    @IsNotEmpty()
    todoListId: string = '';
}

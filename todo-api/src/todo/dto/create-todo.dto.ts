import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTodoDto {
    @IsNumber()
    @IsOptional()
    id?: number;

    @IsString()
    @IsNotEmpty()
    title: string = '';

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsNotEmpty()
    completed: boolean = false;

    @IsDate()
    @IsOptional()
    dueDate?: Date;

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    order: number = 0;

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    todoListId: number = 0;
}

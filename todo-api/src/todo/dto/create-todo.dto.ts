import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTodoDto {
    @IsNumber()
    @IsOptional()
    id?: number;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsNotEmpty()
    completed: boolean;

    @IsDate()
    @IsOptional()
    dueDate?: Date;

    @IsNumber()
    @IsNotEmpty()
    order: number;

    @IsNumber()
    @IsNotEmpty()
    todoListId: number;
}

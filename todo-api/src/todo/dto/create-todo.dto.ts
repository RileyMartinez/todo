import {
    IsBoolean,
    IsDate,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

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
    @IsOptional()
    completed?: boolean;

    @IsDate()
    @IsOptional()
    dueDate?: Date;

    @IsNumber()
    @IsOptional()
    order?: number;

    @IsNumber()
    @IsNotEmpty()
    todoListId: number;
}

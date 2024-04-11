import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTodolistDto {
    @IsNumber()
    @IsOptional()
    id?: number;

    @IsString()
    @IsNotEmpty()
    title: string;
}

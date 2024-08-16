import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class TodoListDto {
    @IsNumber()
    @IsOptional()
    id?: number;

    @IsString()
    @IsNotEmpty()
    title: string = '';
}

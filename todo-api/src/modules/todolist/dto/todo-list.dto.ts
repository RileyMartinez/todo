import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class TodoListDto {
    @IsNumber()
    @IsOptional()
    id?: number;

    @IsString()
    @IsNotEmpty()
    title: string = '';

    @IsNumber()
    @Min(1)
    userId: number = 0;
}

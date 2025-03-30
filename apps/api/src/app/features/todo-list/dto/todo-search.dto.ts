import { IsNotEmpty, IsString, Max, Min, MinLength } from 'class-validator';

export class TodoSearchDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    term: string;

    @IsNotEmpty()
    @Min(1)
    @Max(100)
    limit: number;

    @IsNotEmpty()
    @Min(1)
    page: number;

    constructor(term: string, limit: number, page: number) {
        this.term = term;
        this.limit = limit;
        this.page = page;
    }
}

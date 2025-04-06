import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class TodoListDto {
    /**
     * Todo list id
     * @example 'a1b2c3d4-1234-5678-90ab-cdef12345678'
     */
    @IsString()
    @IsOptional()
    id?: string;

    /**
     * Todo list title
     * @example 'Grocery list'
     */
    @IsString()
    @IsNotEmpty()
    title: string = '';

    /**
     * Todo list icon
     * @example 'shopping-cart'
     */
    @IsString()
    @IsNotEmpty()
    icon: string = '';

    /**
     * Todo list order position
     * @example 1
     */
    @IsNumber()
    @IsNotEmpty()
    order: number = 0;
}

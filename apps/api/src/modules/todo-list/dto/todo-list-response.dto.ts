import { TodoResponseDto } from '@/modules/todo-list/dto/todo-response.dto';

/**
 * Safe response DTO for a TodoList.
 *
 * Excludes the `user` relation to prevent leaking sensitive user data
 * (password, token, verificationCode, etc.) in API responses.
 */
export class TodoListResponseDto {
    /**
     * Todo list id
     * @example 'a1b2c3d4-1234-5678-90ab-cdef12345678'
     */
    id!: string;

    /**
     * Todo list title
     * @example 'Grocery list'
     */
    title!: string;

    /**
     * Todo list icon
     * @example 'shopping-cart'
     */
    icon!: string;

    /**
     * Todo list order position
     * @example 1
     */
    order!: number;

    /**
     * User id
     * @example 'a1b2c3d4-1234-5678-90ab-cdef12345678'
     */
    userId!: string;

    /**
     * Todo list items
     */
    todos?: TodoResponseDto[];
}

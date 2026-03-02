/**
 * Safe response DTO for a Todo item.
 *
 * Excludes the `todoList` back-reference to prevent circular serialization
 * and sensitive data exposure.
 */
export class TodoResponseDto {
    /**
     * Todo item id
     * @example 'a1b2c3d4-1234-5678-90ab-cdef12345678'
     */
    id?: string;

    /**
     * Todo item title
     * @example 'Buy milk'
     */
    title!: string;

    /**
     * Todo item description
     * @example '2% milk'
     */
    description?: string | null;

    /**
     * Todo item completion status
     * @example false
     */
    completed: boolean = false;

    /**
     * Todo item due date
     * @example '2021-12-31T23:59:59.999Z'
     */
    dueDate?: Date | null;

    /**
     * Todo item order
     * @example 1
     */
    order!: number;

    /**
     * Todo list id
     * @example 'a1b2c3d4-1234-5678-90ab-cdef12345678'
     */
    todoListId!: string;
}

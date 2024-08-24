/**
 * Todo API
 * Todo List API with NestJS, TypeORM, and PostgreSQL
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


export interface TodoDto { 
    /**
     * Todo item id
     */
    id?: number;
    /**
     * Todo item title
     */
    title: string;
    /**
     * Todo item description
     */
    description?: string;
    /**
     * Todo item completion status
     */
    completed: boolean;
    /**
     * Todo item due date
     */
    dueDate?: string;
    /**
     * Todo item order
     */
    order: number;
    /**
     * Todo list id
     */
    todoListId: number;
}

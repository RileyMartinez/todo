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
import { Todo } from './todo';

export interface TodoList {
    id: number;
    title: string;
    todos: Array<Todo>;
}

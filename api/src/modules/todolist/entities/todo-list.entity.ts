import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Todo } from './todo.entity';

@Entity()
export class TodoList {
    /**
     * Todo list id
     * @example 1
     */
    @PrimaryGeneratedColumn()
    id!: number;

    /**
     * Todo list title
     * @example 'Grocery list'
     */
    @Column()
    title!: string;

    /**
     * User id
     * @example 1
     */
    @Column()
    userId!: number;

    /**
     * Todo list items
     * @example [{ title: 'Buy milk', description: '2% milk', completed: false, dueDate: '2021-12-31T23:59:59.999Z', order: 1 }]
     */
    @OneToMany(() => Todo, (todo) => todo.todoList)
    todos: Todo[] | undefined;
}

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TodoList } from './todo-list.entity';

@Entity()
export class Todo {
    /**
     * Todo item id
     * @example 'a1b2c3d4-1234-5678-90ab-cdef12345678'
     */
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    /**
     * Todo item title
     * @example 'Buy milk'
     */
    @Column()
    title!: string;

    /**
     * Todo item description
     * @example '2% milk'
     */
    @Column({
        type: 'text',
        nullable: true,
    })
    description?: string | null;

    /**
     * Todo item completion status
     * @example false
     */
    @Column({ default: false })
    completed: boolean = false;

    /**
     * Todo item due date
     * @example 2021-12-31T23:59:59.999Z
     */
    @Column({
        type: 'timestamp',
        nullable: true,
    })
    dueDate?: Date | null;

    /**
     * Todo item order
     * @example 1
     */
    @Column()
    order!: number;

    /**
     * Todo list id
     * @example 'a1b2c3d4-1234-5678-90ab-cdef12345678'
     */
    @Column()
    todoListId!: string;

    @ManyToOne(() => TodoList, (todoList) => todoList.todos, {
        onDelete: 'CASCADE',
    })
    todoList!: TodoList;
}

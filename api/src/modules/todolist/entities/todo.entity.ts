import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TodoList } from './todo-list.entity';

@Entity()
export class Todo {
    /**
     * Todo item id
     * @example 1
     */
    @PrimaryGeneratedColumn()
    id!: number;

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
    @Column({ type: 'text', nullable: true })
    description: string | null = null;

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
    @Column({ type: 'timestamp', nullable: true })
    dueDate: Date | null = null;

    /**
     * Todo item order
     * @example 1
     */
    @Column()
    order!: number;

    /**
     * Todo list id
     * @example 1
     */
    @Column()
    todoListId!: number;

    @ManyToOne(() => TodoList, (todoList) => todoList.todos, {
        onDelete: 'CASCADE',
    })
    todoList!: TodoList;
}

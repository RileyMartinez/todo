import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Todo } from './todo.entity';

@Entity()
export class TodoList {
    /**
     * Todo list id
     * @example 'a1b2c3d4-1234-5678-90ab-cdef12345678'
     */
    @PrimaryGeneratedColumn('uuid')
    id!: string;

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
    userId!: string;

    @ManyToOne(() => User, (user) => user.todoLists, {
        onDelete: 'CASCADE',
    })
    user!: User;

    /**
     * Todo list items
     * @example [{ title: 'Buy milk', description: '2% milk', completed: false, dueDate: '2021-12-31T23:59:59.999Z', order: 1 }]
     */
    @OneToMany(() => Todo, (todo) => todo.todoList)
    todos: Todo[] | undefined;
}

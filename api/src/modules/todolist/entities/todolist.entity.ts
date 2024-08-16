import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Todo } from './todo.entity';

@Entity()
export class TodoList {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    userId!: number;

    @OneToMany(() => Todo, (todo) => todo.todoList)
    todos: Todo[] | undefined;
}

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Todo } from '../../todo/entities/todo.entity';

@Entity()
export class TodoList {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @OneToMany(() => Todo, (todo) => todo.todoList)
    todos: Todo[];
}

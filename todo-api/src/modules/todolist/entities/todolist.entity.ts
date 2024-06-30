import { Todo } from 'src/modules/todo/entities/todo.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TodoList {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @OneToMany(() => Todo, (todo) => todo.todoList)
    todos: Todo[] | undefined;
}

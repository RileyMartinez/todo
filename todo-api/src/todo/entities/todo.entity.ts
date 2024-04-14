import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TodoList } from '../../todolist/entities/todolist.entity';

@Entity()
export class Todo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: false })
    completed: boolean;

    @Column({ type: 'timestamp', nullable: true })
    dueDate: Date;

    @Column()
    order: number;

    @Column()
    todoListId: number;

    @ManyToOne(() => TodoList, (todoList) => todoList.todos, {
        onDelete: 'CASCADE',
    })
    todoList: TodoList;
}

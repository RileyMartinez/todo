import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TodoList } from '../../todolist/entities/todolist.entity';

@Entity()
export class Todo {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column({ type: 'text', nullable: true })
    description: string | null = null;

    @Column({ default: false })
    completed: boolean = false;

    @Column({ type: 'timestamp', nullable: true })
    dueDate: Date | null = null;

    @Column()
    order!: number;

    @Column()
    todoListId!: number;

    @ManyToOne(() => TodoList, (todoList) => todoList.todos, {
        onDelete: 'CASCADE',
    })
    todoList!: TodoList;
}

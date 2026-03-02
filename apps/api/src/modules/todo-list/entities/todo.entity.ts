import { TodoResponseDto } from '@/modules/todo-list/dto/todo-response.dto';
import { TodoList } from '@/modules/todo-list/entities/todo-list.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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

    /**
     * Maps this Todo entity to a safe response DTO (excludes todoList back-reference).
     */
    toResponseDto(): TodoResponseDto {
        const dto = new TodoResponseDto();
        dto.id = this.id;
        dto.title = this.title;
        dto.description = this.description;
        dto.completed = this.completed;
        dto.dueDate = this.dueDate;
        dto.order = this.order;
        dto.todoListId = this.todoListId;
        return dto;
    }
}

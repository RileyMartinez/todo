import { TodoListResponseDto } from '@/modules/todo-list/dto/todo-list-response.dto';
import { Todo } from '@/modules/todo-list/entities/todo.entity';
import { User } from '@/modules/user/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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
     * Todo list icon
     * @example 'shopping-cart'
     */
    @Column()
    icon!: string;

    /**
     * Todo list order position
     * @example 1
     */
    @Column()
    order!: number;

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

    /**
     * Maps this TodoList entity to a safe response DTO (excludes user relation).
     */
    toResponseDto(): TodoListResponseDto {
        const dto = new TodoListResponseDto();
        dto.id = this.id;
        dto.title = this.title;
        dto.icon = this.icon;
        dto.order = this.order;
        dto.userId = this.userId;
        dto.todos = this.todos?.map((todo) => todo.toResponseDto());
        return dto;
    }
}

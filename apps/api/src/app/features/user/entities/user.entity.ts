import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { TodoList } from '../../todo-list/entities/todo-list.entity';

@Entity()
@Unique(['email'])
export class User {
    /**
     * User id
     * @example 'a1b2c3d4-1234-5678-90ab-cdef12345678'
     */
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    /**
     * User email address
     * @example foo.bar@foobar.com
     */
    @Column()
    email!: string;

    /**
     * User hashed password
     */
    @Column({
        type: 'text',
        nullable: true,
    })
    password: string | null = null;

    /**
     * User hashed token
     */
    @Column({
        type: 'text',
        nullable: true,
    })
    token: string | null = null;

    @Column({
        default: 1,
    })
    tokenVersion: number = 1;

    @Column({
        default: false,
    })
    isVerified: boolean = false;

    @Column({
        type: 'int',
        nullable: true,
    })
    verificationCode: number | null = null;

    @Column({
        type: 'text',
        nullable: true,
    })
    avatar: string | null = null;

    @OneToMany(() => TodoList, (todoList) => todoList.user, {
        cascade: true,
    })
    todoLists!: TodoList[];
}

import { UserContextDto } from '@/common/dto/user-context.dto';
import { TodoList } from '@/modules/todo-list/entities/todo-list.entity';
import { SafeUserDto } from '@/modules/user/dto/safe-user.dto';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

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
     * User display name
     * @example John Doe
     */
    @Column({
        type: 'text',
        nullable: true,
    })
    displayName: string | null = null;

    /**
     * User email address
     * @example foo.bar@foobar.com
     */
    @Column()
    email!: string;

    /**
     * User hashed password
     */
    @Column()
    password!: string;

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

    /**
     * Maps this User entity to a UserContextDto.
     */
    toUserContextDto(): UserContextDto {
        return new UserContextDto(this.id, this.email, this.displayName, this.isVerified, this.avatar);
    }

    /**
     * Maps this User entity to a SafeUserDto (excludes sensitive fields).
     */
    toSafeUserDto(): SafeUserDto {
        return new SafeUserDto(this);
    }
}

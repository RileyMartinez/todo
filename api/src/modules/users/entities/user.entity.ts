import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { AutoMap } from '@automapper/classes';

@Entity()
@Unique(['email'])
export class User {
    /**
     * User id
     * @example 1
     */
    @AutoMap()
    @PrimaryGeneratedColumn()
    id!: number;

    /**
     * User email address
     * @example foo.bar@foobar.com
     */
    @AutoMap()
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
}

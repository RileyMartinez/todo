import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

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
    @Column({ nullable: true })
    password?: string;

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
}

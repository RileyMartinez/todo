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
    id: number;

    /**
     * User email address
     * @example foo.bar@foobar.com
     */
    @AutoMap()
    @Column()
    email: string;

    /**
     * User password
     * @example fooBar123!
     */
    @Column()
    password: string;

    /**
     * User jwt refresh token
     * @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkZvbyBCYXIiLCJpYXQiOjE1MTYyMzkwMjJ9.1Jf8
     */
    @Column({ nullable: true })
    refreshToken: string;
}

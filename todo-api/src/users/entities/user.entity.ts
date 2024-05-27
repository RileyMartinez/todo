import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { AutoMap } from '@automapper/classes';

@Entity()
@Unique(['email'])
export class User {
    @AutoMap()
    @PrimaryGeneratedColumn()
    id: number;

    @AutoMap()
    @Column()
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    refreshToken: string;
}

import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { SafeUserDto } from '../dto/safe-user.dto';

@Entity()
@Unique(['email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    refreshToken: string;

    toSafeUserDto(): SafeUserDto {
        return {
            id: this.id,
            email: this.email,
        };
    }
}

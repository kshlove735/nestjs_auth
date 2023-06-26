import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    userId: number;

    @Column({ unique: true })
    id: string;

    @Column()
    pw: string;

    @Column()
    name: string;

    @Column()
    role: string;

    @Column()
    email: string;

    @Column()
    nickname: string;

    @Column({ nullable: true })
    currentRefreshToken: string;

    @Column({ type: 'datetime', nullable: true })
    currentRefreshTokenExp: Date
}


import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    userId: string;

    @Column()
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

    @Column()
    token: string;
}


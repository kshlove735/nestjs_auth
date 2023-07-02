import { number } from "joi";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { RoleType } from "../enum/role-type.enum";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    userId: number;

    @Column({ unique: true })
    id: string;

    @Column({ type: "varchar", length: 80 })
    pw: string;

    @Column({ type: "varchar", length: 50 })
    name: string;

    @Column({ type: "varchar", length: 50 })
    role: RoleType;

    @Column({ type: "varchar", length: 50 })
    email: string;

    @Column({ type: "varchar", length: 50 })
    nickname: string;

    @Column({ type: "varchar", length: 80, nullable: true })
    currentRefreshToken?: string;

    @Column({ type: 'datetime', nullable: true })
    currentRefreshTokenExp?: Date
}


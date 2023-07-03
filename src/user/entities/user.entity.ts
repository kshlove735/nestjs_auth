import { IsDate, IsEmail, IsString } from "class-validator";
import { number } from "joi";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { RoleType } from "../enum/role-type.enum";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    userId: number;

    @IsString()
    @Column({ unique: true })
    id: string;

    @IsString()
    @Column({ type: "varchar", length: 80 })
    pw: string;

    @IsString()
    @Column({ type: "varchar", length: 50 })
    name: string;

    @IsString()
    @Column({ type: "varchar", length: 50 })
    role: RoleType;

    @IsEmail()
    @Column({ type: "varchar", length: 50, unique: true })
    email: string;

    @IsString()
    @Column({ type: "varchar", length: 50 })
    nickname: string;

    @IsString()
    @Column({ type: "varchar", length: 80, nullable: true })
    currentRefreshToken?: string;

    @IsDate()
    @Column({ type: 'datetime', nullable: true })
    currentRefreshTokenExp?: Date
}


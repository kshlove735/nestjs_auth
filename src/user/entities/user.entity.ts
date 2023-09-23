import { IsDate, IsEmail, IsOptional, IsString } from "class-validator";
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { RoleType } from "../enum/role-type.enum";
import { Exclude } from "class-transformer";
import * as bcrypt from 'bcrypt';

export enum Provider {
    Local = 'Local',
    Google = 'Google',
    Kakako = 'Kakako',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    userId: number;

    @IsString()
    @Column({ unique: true })
    id: string;

    // @Exclude({ toPlainOnly: true })
    @IsOptional()
    @IsString()
    @Column({ type: "varchar", length: 80, nullable: true })
    pw?: string;

    @IsOptional()
    @IsString()
    @Column({ type: "varchar", length: 50, nullable: true })
    name?: string;

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

    @Column({ nullable: true })
    @IsOptional()
    @IsString()
    photo?: string;

    @Column({ type: 'enum', enum: Provider, default: Provider.Local })
    provider: Provider;

    // @BeforeInsert()
    // @BeforeUpdate()
    // private async hashPassword() {
    //     if (this.pw && this.provider === Provider.Local && this.tempPw !== this.pw) {
    //         this.pw = await bycrpt.hash(this.pw, 10);
    //     }
    // }

}


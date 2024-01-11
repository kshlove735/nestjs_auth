import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RoleType } from '../enum/role-type.enum';
import { File } from 'src/file/entities/file.entity';

export enum Provider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  KAKAO = 'KAKAO',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ unique: true })
  id: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  pw?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  name?: string;

  @Column({ type: 'enum', enum: RoleType, default: RoleType.USER })
  role: RoleType;

  @Column({ type: 'varchar', length: 50, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  nickname: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  currentRefreshToken?: string;

  @Column({ type: 'datetime', nullable: true })
  currentRefreshTokenExp?: Date;

  @Column({ nullable: true })
  photo?: string;

  @Column({ type: 'enum', enum: Provider, default: Provider.LOCAL })
  provider: Provider;

  @OneToMany(() => File, (file) => file.user)
  files: File[];

  // @BeforeInsert()
  // @BeforeUpdate()
  // private async hashPassword() {
  //     if (this.pw && this.provider === Provider.Local && this.tempPw !== this.pw) {
  //         this.pw = await bycrpt.hash(this.pw, 10);
  //     }
  // }
}

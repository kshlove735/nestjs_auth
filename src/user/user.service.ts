import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {

  constructor(
    private readonly userRepository: UserRepository
  ) { }

  async signUp(createUserDto: CreateUserDto) {

    // pw 암호화
    await this.transformPw(createUserDto);

    // DB 저장
    return await this.userRepository.createUser(createUserDto);
  }

  async findUserById(id: string): Promise<User> {
    return await this.userRepository.findUserById(id);
  }


  async transformPw(createUserDto: CreateUserDto) {
    const salt: string = await bcrypt.genSalt();
    createUserDto.pw = await bcrypt.hash(createUserDto.pw, salt);
  }
}

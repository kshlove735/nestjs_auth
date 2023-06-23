import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {

  constructor(
    private readonly userRepository: UserRepository
  ) { }

  async findUserById(id: string): Promise<User> {
    return await this.userRepository.findUserById(id);
  }
}

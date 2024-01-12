import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findUserById(id: string): Promise<User> {
    return await this.userRepository.findUserById(id);
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: number): Promise<User> | null {
    const user: User = await this.userRepository.findUserByUserId(userId);

    // DB에 저장된 refresh token 이 없다면
    if (!user?.currentRefreshToken) return null;

    const isRefreshTokenMatching: boolean = await bcrypt.compare(refreshToken, user.currentRefreshToken);

    if (isRefreshTokenMatching) return user;
  }
}

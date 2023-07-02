import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt'
import { ConfigService } from '@nestjs/config';
import { UpdateResult } from 'typeorm';
import { UserExculdedFromCriticalInfoDto } from './dto/user-exculded-from-critical-info.dto';

@Injectable()
export class UserService {

  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService
  ) { }

  async signUp(createUserDto: CreateUserDto): Promise<User> {

    // pw 암호화
    createUserDto.pw = await this.encrypt(createUserDto.pw);

    // DB 저장
    return await this.userRepository.createUser(createUserDto);
  }

  async findUserById(id: string): Promise<User> {
    return await this.userRepository.findUserById(id);
  }


  async encrypt(plainText: string): Promise<string> {
    const salt: string = await bcrypt.genSalt();
    return await bcrypt.hash(plainText, salt);
  }

  async setCurrentRefreshToken(userId: number, refreshToken: string): Promise<UpdateResult> {
    const hashedCurrentRefreshToken: string = await this.encrypt(refreshToken);
    const currentRefreshTokenExp: Date = await this.getCurrentRefreshTokenExp();
    return await this.userRepository.setCurrentRefreshToken(userId, hashedCurrentRefreshToken, currentRefreshTokenExp);
  }

  async getCurrentRefreshTokenExp(): Promise<Date> {
    const currentDate = new Date();
    const currentRefreshTokenExp = new Date(currentDate.getTime() + (Number(this.configService.get('JWT_REFRESH_EXPIRATION_TIME')) * 1000));
    return currentRefreshTokenExp;
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: number): Promise<User> | null {
    const user: User = await this.userRepository.findUserByUserId(userId);

    // DB에 저장된 refresh token 이 없다면 
    if (!user?.currentRefreshToken) return null;

    const isRefreshTokenMatching: boolean = await bcrypt.compare(refreshToken, user.currentRefreshToken);

    if (isRefreshTokenMatching) return user;
  }

  async removeRefreshToken(userId: number): Promise<UpdateResult> {
    return await this.userRepository.removeRefreshToken(userId);
  }

  getUserExculdedFromCriticalInfo(user: User): UserExculdedFromCriticalInfoDto {
    const { pw, currentRefreshToken, currentRefreshTokenExp, ...userExculdedFromCriticalInfo } = user;
    return userExculdedFromCriticalInfo;
  }
}

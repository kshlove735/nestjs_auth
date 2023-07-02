import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'

import { ConfigService } from '@nestjs/config';
import { Payload } from './interface/payload';
import { UserRepository } from 'src/user/user.repository';
import { UserExculdedFromCriticalInfoDto } from '../user/dto/user-exculded-from-critical-info.dto';


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }
  async validateUser(loginDto: LoginDto): Promise<User> {
    const user: User = await this.userService.findUserById(loginDto.id);

    if (!user) throw new NotFoundException('User not found');
    if (! await this.validatePw(loginDto.pw, user.pw)) throw new BadRequestException('Invalid credentials');

    return user;
  }

  async validatePw(pw: string, hashPw: string): Promise<boolean> {
    return await bcrypt.compare(pw, hashPw);
  }

  async generateAccessToken(user: User) {
    const payload: Payload = { sub: user.userId, username: user.name, email: user.email, role: user.role }
    // JwtModule에서 동적으로 옵션 설정 지정
    const token: string = await this.jwtService.signAsync(payload)
    return {
      accessToken: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge: Number(this.configService.get('JWT_ACCESS_EXPIRATION_TIME')) * 1000
    }
  }

  async generateRefreshToken(user: User) {
    const payload = { sub: user.userId }
    const token: string = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: `${this.configService.get('JWT_REFRESH_EXPIRATION_TIME')}s`
    })
    return {
      refreshToken: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge: Number(this.configService.get('JWT_REFRESH_EXPIRATION_TIME')) * 1000
    }

  }

  // async refresh(user: User) {

  //   // 새로운  access token 생성
  //   const payload: Payload = { sub: user.userId, username: user.name, email: user.email, role: user.role }
  //   const accessToken: string = await this.generateAccessToken(payload)
  //   return accessToken;
  // }

}

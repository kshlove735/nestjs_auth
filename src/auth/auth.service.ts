import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'

import { ConfigService } from '@nestjs/config';
import { Payload } from './interface/payload';


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }
  async validateUser(loginDto: LoginDto): Promise<Payload> {
    const user: User = await this.userService.findUserById(loginDto.id);

    if (!user) throw new NotFoundException('User not found');
    if (! await this.validatePw(loginDto.pw, user.pw)) throw new BadRequestException('Invalid credentials');

    const payload: Payload = { sub: user.userId, username: user.name, email: user.email }

    return payload;
  }

  async validatePw(pw: string, hashPw: string): Promise<boolean> {
    return await bcrypt.compare(pw, hashPw);
  }

  async generateAccessToken(payload: Payload): Promise<string> {
    // JwtModule에서 동적으로 옵션 설정 지정
    return await this.jwtService.signAsync(payload);
  }

  async generateRefreshToken(payload: Payload): Promise<string> {
    return await this.jwtService.signAsync({ sub: payload.sub }, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME')
    })
  }

  async refresh(refreshToken: string): Promise<string> {
    // refresh token이 유효한지 확인
    const decodedRefreshToken = await this.jwtService.verify(refreshToken, { secret: this.configService.get('JWT_REFRESH_SECRET') }) as Payload;
    const userId: number = decodedRefreshToken.sub;

    // DB에 저장된 해시된 refresh token과 동일한지
    const user: User | null = await this.userService.getUserIfRefreshTokenMatches(refreshToken, userId)

    if (!user) throw new UnauthorizedException('Invalid user!');

    // 새로운  access token 생성
    const payload: Payload = { sub: user.userId, username: user.name, email: user.email }
    const accessToken: string = await this.generateAccessToken(payload)
    return accessToken;
  }

}

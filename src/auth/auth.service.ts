import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { Provider, User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'

import { ConfigService } from '@nestjs/config';
import { Payload } from './interface/payload.interface';
import { UserRepository } from 'src/user/user.repository';
import { UserExculdedFromCriticalInfoDto } from '../user/dto/user-exculded-from-critical-info.dto';
import { AccessTokenWithOption } from './interface/access-token-with-option.interface';
import { RefreshTokenWithOption } from './interface/refresh-token-with-option.interface';
import { GoogleRequest } from './interface/auth.interface';
import { Response } from 'express';
import { ConflictException } from "@nestjs/common";
import { SignInResult } from './interface/sign-in-result.interface';


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
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

  async generateAccessToken(user: User): Promise<AccessTokenWithOption> {
    const payload: Payload = { sub: user.userId, role: user.role }
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

  async generateRefreshToken(user: User): Promise<RefreshTokenWithOption> {
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

  async googleLogin(req: GoogleRequest, res: Response) {
    try {
      const {
        user: { email, firstName, lastName, photo },
      } = req;
      // let accessToken: AccessTokenWithOption;
      // let refreshToken: RefreshTokenWithOption;

      // 유저 중복 검사
      const findUser = await this.userRepository.findUserByEmail(email);
      if (findUser && findUser.provider === Provider.Local) {
        throw new ConflictException('Existing Email')
      }

      // 유저 생성
      if (!findUser) {
        let name = `${lastName} ${firstName}`;
        let id = email;
        let nickname = email;
        let googleUser = this.userRepository.create({ id, email, name, nickname, photo, provider: Provider.Google });
        googleUser = await this.userRepository.createUser(googleUser);

        // 생성된 구글 유저로부터 accessToken & refreshToken 발급
        const { accessToken, ...accessOption } = await this.generateAccessToken(googleUser);
        const { refreshToken, ...refreshOption } = await this.generateRefreshToken(googleUser);
        res.setHeader('Authorization', `Bearer ${[accessToken, refreshToken]}`);
        res.cookie('access_token', accessToken, accessOption);
        res.cookie('refresh_token', refreshToken, refreshOption)

        await this.userService.setCurrentRefreshToken(googleUser.userId, refreshToken);

        const userExculdedFromCriticalInfo: UserExculdedFromCriticalInfoDto = this.userService.getUserExculdedFromCriticalInfo(googleUser);
        const result: SignInResult = {
          message: 'login success',
          user: userExculdedFromCriticalInfo
        }
        return result
      }

      // 구글 가입이 되어 있는 경우
      const { accessToken, ...accessOption } = await this.generateAccessToken(findUser);
      const { refreshToken, ...refreshOption } = await this.generateRefreshToken(findUser);
      res.setHeader('Authorization', `Bearer ${[accessToken, refreshToken]}`);
      res.cookie('access_token', accessToken, accessOption);
      res.cookie('refresh_token', refreshToken, refreshOption)

      await this.userService.setCurrentRefreshToken(findUser.userId, refreshToken);

      const userExculdedFromCriticalInfo: UserExculdedFromCriticalInfoDto = this.userService.getUserExculdedFromCriticalInfo(findUser);
      const result: SignInResult = {
        message: 'login success',
        user: userExculdedFromCriticalInfo
      }
      return result
    } catch (error) {
      return { ok: false, error: '구글 로그인 인증을 실패하였습니다.' };
    }
  }

}

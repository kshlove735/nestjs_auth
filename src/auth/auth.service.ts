import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { Provider, User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Payload } from './interface/payload.interface';
import { UserRepository } from 'src/user/user.repository';
import { AccessTokenWithOption } from './interface/access-token-with-option.interface';
import { RefreshTokenWithOption } from './interface/refresh-token-with-option.interface';
import { GoogleRequest, KakaoRequest } from './interface/auth.interface';
import { Response } from 'express';
import { ConflictException } from '@nestjs/common';
import { SignInResult } from './interface/sign-in-result.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async validateUser(loginDto: LoginDto): Promise<User> {
    const user: User = await this.userService.findUserById(loginDto.id);

    if (!user) throw new NotFoundException('User not found');
    if (!(await this.validatePw(loginDto.pw, user.pw)))
      throw new BadRequestException('Invalid credentials');

    return user;
  }

  async validatePw(pw: string, hashPw: string): Promise<boolean> {
    return await bcrypt.compare(pw, hashPw);
  }

  async generateAccessToken(user: User): Promise<AccessTokenWithOption> {
    const payload: Payload = {
      sub: user.userId,
      role: user.role,
      provider: user.provider,
    };
    // JwtModule에서 동적으로 옵션 설정 지정
    const token: string = await this.jwtService.signAsync(payload);
    return {
      accessToken: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge:
        Number(this.configService.get('JWT_ACCESS_EXPIRATION_TIME')) * 1000,
    };
  }

  async generateRefreshToken(user: User): Promise<RefreshTokenWithOption> {
    const payload = { sub: user.userId };
    const token: string = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: `${this.configService.get('JWT_REFRESH_EXPIRATION_TIME')}s`,
    });
    return {
      refreshToken: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge:
        Number(this.configService.get('JWT_REFRESH_EXPIRATION_TIME')) * 1000,
    };
  }

  async googleLogin(req: GoogleRequest, res: Response) {
    try {
      const {
        user: { email, name, photo },
      } = req;

      const id: string = email;
      const nickname: string = name;

      // 유저 중복 검사 및 유저 회원 가입
      const findUser = await this.userRepository.findOneOrCreate(
        { where: { email } },
        { id, email, name, nickname, photo, provider: Provider.Google },
      );

      if (findUser && findUser.provider !== Provider.Google) {
        throw new ConflictException(
          '현재 계정으로 가입한 이메일이 존재합니다.',
        );
      }

      // 생성된 구글 유저로부터 accessToken & refreshToken 발급
      const { accessToken, ...accessOption } = await this.generateAccessToken(
        findUser,
      );
      const { refreshToken, ...refreshOption } =
        await this.generateRefreshToken(findUser);
      res.setHeader('Authorization', `Bearer ${[accessToken, refreshToken]}`);
      res.cookie('access_token', accessToken, accessOption);
      res.cookie('refresh_token', refreshToken, refreshOption);
      await this.userService.setCurrentRefreshToken(
        findUser.userId,
        refreshToken,
      );

      // const userExculdedFromCriticalInfo: UserExculdedFromCriticalInfoDto =
      //   this.userService.getUserExculdedFromCriticalInfo(findUser);
      const result: SignInResult = {
        message: '로그인 성공',
        user: findUser,
      };
      return result;
    } catch (error) {
      throw new Error(error);
    }
  }

  async kakaoLogin(req: KakaoRequest, res: Response) {
    try {
      const {
        user: { email, nickname, photo },
      } = req;

      const id: string = email;
      const name: string = nickname;

      // 유저 중복 검사 및 유저 회원 가입
      const findUser = await this.userRepository.findOneOrCreate(
        { where: { email } },
        { id, email, name, nickname, photo, provider: Provider.Kakako },
      );

      if (findUser && findUser.provider !== Provider.Kakako) {
        throw new ConflictException(
          '현재 계정으로 가입한 이메일이 존재합니다.',
        );
      }

      // 생성된 카카오 유저로부터 accessToken & refreshToken 발급
      const { accessToken, ...accessOption } = await this.generateAccessToken(
        findUser,
      );
      const { refreshToken, ...refreshOption } =
        await this.generateRefreshToken(findUser);
      res.setHeader('Authorization', `Bearer ${[accessToken, refreshToken]}`);
      res.cookie('access_token', accessToken, accessOption);
      res.cookie('refresh_token', refreshToken, refreshOption);
      await this.userService.setCurrentRefreshToken(
        findUser.userId,
        refreshToken,
      );

      const result: SignInResult = {
        message: '로그인 성공',
        user: findUser,
      };
      return result;
    } catch (error) {
      throw new Error(error);
    }
  }
}

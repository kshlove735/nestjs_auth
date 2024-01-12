import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
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
import { RoleType } from 'src/user/enum/role-type.enum';
import { RefreshResDto, SigninResDto, SignupResDto } from './dto/res.dto';
import { UpdateResult } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(
    id: string,
    pw: string,
    name: string,
    role: RoleType,
    email: string,
    nickname: string,
    photo: string,
    provider: Provider,
  ): Promise<SignupResDto> {
    // 비밀번호 암호화
    const hashedPw: string = await this.encrypt(pw);

    // User 정보 DB에 저장
    return await this.userRepository.createUser({ id, pw: hashedPw, name, role, email, nickname, photo, provider });
  }

  async signin(id: string, pw: string, res: Response): Promise<SigninResDto> {
    // DB에 저장된 암호호된 비밀번호와 동일한지 확인
    const user: User = await this.validateUser(id, pw);

    // 토근 생성
    const { accessToken, ...accessOption } = await this.generateAccessToken(user);
    const { refreshToken, ...refreshOption } = await this.generateRefreshToken(user);

    // DB에 refresh token 저장
    await this.setCurrentRefreshToken(user.userId, refreshToken);

    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.cookie('access_token', accessToken, accessOption);
    res.cookie('refresh_token', refreshToken, refreshOption);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(user: User, res: Response): Promise<RefreshResDto> {
    const { accessToken, ...accessOption } = await this.generateAccessToken(user);
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.cookie('access_token', accessToken, accessOption);

    return { accessToken };
  }

  async removeRefreshToken(userId: number): Promise<void> {
    await this.userRepository.removeRefreshToken(userId);
  }

  private async validateUser(id: string, pw: string): Promise<User> {
    const user: User = await this.userService.findUserById(id);

    if (!user) throw new NotFoundException('User not found');
    if (!(await this.validatePw(pw, user.pw))) throw new BadRequestException('Invalid credentials');

    return user;
  }

  private async validatePw(pw: string, hashPw: string): Promise<boolean> {
    return await bcrypt.compare(pw, hashPw);
  }

  private async generateAccessToken(user: User): Promise<AccessTokenWithOption> {
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
      maxAge: Number(this.configService.get('JWT_ACCESS_EXPIRATION_TIME')) * 1000,
    };
  }

  private async generateRefreshToken(user: User): Promise<RefreshTokenWithOption> {
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
      maxAge: Number(this.configService.get('JWT_REFRESH_EXPIRATION_TIME')) * 1000,
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
        { id, email, name, nickname, photo, provider: Provider.GOOGLE },
      );

      if (findUser && findUser.provider !== Provider.GOOGLE) {
        throw new ConflictException('현재 계정으로 가입한 이메일이 존재합니다.');
      }

      // 생성된 구글 유저로부터 accessToken & refreshToken 발급
      const { accessToken, ...accessOption } = await this.generateAccessToken(findUser);
      const { refreshToken, ...refreshOption } = await this.generateRefreshToken(findUser);
      res.setHeader('Authorization', `Bearer ${[accessToken, refreshToken]}`);
      res.cookie('access_token', accessToken, accessOption);
      res.cookie('refresh_token', refreshToken, refreshOption);
      await this.setCurrentRefreshToken(findUser.userId, refreshToken);

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
        { id, email, name, nickname, photo, provider: Provider.KAKAO },
      );

      if (findUser && findUser.provider !== Provider.KAKAO) {
        throw new ConflictException('현재 계정으로 가입한 이메일이 존재합니다.');
      }

      // 생성된 카카오 유저로부터 accessToken & refreshToken 발급
      const { accessToken, ...accessOption } = await this.generateAccessToken(findUser);
      const { refreshToken, ...refreshOption } = await this.generateRefreshToken(findUser);
      res.setHeader('Authorization', `Bearer ${[accessToken, refreshToken]}`);
      res.cookie('access_token', accessToken, accessOption);
      res.cookie('refresh_token', refreshToken, refreshOption);
      await this.setCurrentRefreshToken(findUser.userId, refreshToken);

      const result: SignInResult = {
        message: '로그인 성공',
        user: findUser,
      };
      return result;
    } catch (error) {
      throw new Error(error);
    }
  }

  private async encrypt(plainText: string): Promise<string> {
    const salt: string = await bcrypt.genSalt();
    return await bcrypt.hash(plainText, salt);
  }

  private async setCurrentRefreshToken(userId: number, refreshToken: string): Promise<UpdateResult> {
    const hashedCurrentRefreshToken: string = await this.encrypt(refreshToken);
    const currentRefreshTokenExp: Date = await this.getCurrentRefreshTokenExp();
    return await this.userRepository.setCurrentRefreshToken(userId, hashedCurrentRefreshToken, currentRefreshTokenExp);
  }

  private async getCurrentRefreshTokenExp(): Promise<Date> {
    const currentDate = new Date();
    const currentRefreshTokenExp = new Date(
      currentDate.getTime() + Number(this.configService.get('JWT_REFRESH_EXPIRATION_TIME')) * 1000,
    );
    return currentRefreshTokenExp;
  }
}

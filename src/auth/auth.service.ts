import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { Provider, User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from 'src/user/user.repository';
import { Response } from 'express';
import { ConflictException } from '@nestjs/common';
import { RoleType } from 'src/user/enum/role-type.enum';
import { RefreshResDto, SigninResDto, UserInfoResDto } from './dto/res.dto';
import { UpdateResult } from 'typeorm';
import { SocialUserAfterAuth } from './decorator/social-user.decorator';
import { AccessTokenWithOptionDto, PayloadDto, RefreshTokenWithOptionDto } from './dto/function.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(
    pw: string,
    role: RoleType,
    email: string,
    nickname: string,
    photo: string,
    provider: Provider,
  ): Promise<UserInfoResDto> {
    // 비밀번호 암호화
    const hashedPw: string = await this.encrypt(pw);

    // User 정보 DB에 저장
    return await this.userRepository.createUser({ pw: hashedPw, role, email, nickname, photo, provider });
  }

  async signin(email: string, pw: string, res: Response): Promise<SigninResDto> {
    // DB에 저장된 암호호된 비밀번호와 동일한지 확인
    const user: User = await this.validateUser(email, pw);

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

  async OAuthLogin(socialUser: SocialUserAfterAuth, res: Response): Promise<UserInfoResDto> {
    try {
      const { email, nickname, photo, provider } = socialUser;

      // 유저 중복 검사 및 유저 회원 가입
      const findUser: User = await this.userRepository.findOneOrCreate(
        { where: { email } },
        { email, nickname, photo, provider: provider.toUpperCase() as Provider },
      );

      if (findUser && findUser.provider !== (provider.toUpperCase() as Provider)) {
        throw new ConflictException('현재 계정으로 가입한 이메일이 존재합니다.');
      }

      // 생성된 구글 유저로부터 accessToken & refreshToken 발급
      const { accessToken, ...accessOption } = await this.generateAccessToken(findUser);
      const { refreshToken, ...refreshOption } = await this.generateRefreshToken(findUser);
      res.setHeader('Authorization', `Bearer ${accessToken}`);
      res.cookie('access_token', accessToken, accessOption);
      res.cookie('refresh_token', refreshToken, refreshOption);
      await this.setCurrentRefreshToken(findUser.userId, refreshToken);

      return {
        userId: findUser.userId,
        email: findUser.email,
        role: findUser.role,
        nickname: findUser.nickname,
        photo: findUser.photo,
        provider: findUser.provider,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  private async validateUser(email: string, pw: string): Promise<User> {
    const user: User = await this.userService.findUserByEmail(email);

    if (!user) throw new NotFoundException('User not found');
    if (!(await this.validatePw(pw, user.pw))) throw new BadRequestException('Invalid credentials');

    return user;
  }

  private async validatePw(pw: string, hashPw: string): Promise<boolean> {
    return await bcrypt.compare(pw, hashPw);
  }

  private async generateAccessToken(user: User): Promise<AccessTokenWithOptionDto> {
    const payload: PayloadDto = {
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

  private async generateRefreshToken(user: User): Promise<RefreshTokenWithOptionDto> {
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

import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  UnauthorizedException,
  Req,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { Public } from 'src/common/decorator/public.decorator';
import { UserService } from 'src/user/user.service';
import { SignInResult } from './interface/sign-in-result.interface';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { Role } from 'src/common/decorator/role.decorator';
import { RoleType } from 'src/user/enum/role-type.enum';
import { User } from 'src/user/entities/user.entity';
import { GoogleRequest, KakaoRequest } from './interface/auth.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  /**
   * @description 로그인
   * @param loginDt
   * @param res
   * @returns result
   */
  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('auth/login')
  async signIn(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SignInResult> {
    // DB에 저장된 암호호된 비밀번호와 동일한지 확인
    const user: User = await this.authService.validateUser(loginDto);

    // 토근 생성
    const { accessToken, ...accessOption } =
      await this.authService.generateAccessToken(user);
    const { refreshToken, ...refreshOption } =
      await this.authService.generateRefreshToken(user);

    // DB에 refresh token 저장
    await this.userService.setCurrentRefreshToken(user.userId, refreshToken);

    res.setHeader('Authorization', `Bearer ${[accessToken, refreshToken]}`);
    res.cookie('access_token', accessToken, accessOption);
    res.cookie('refresh_token', refreshToken, refreshOption);

    const result: SignInResult = {
      message: 'login success',
      user,
    };
    return result;
  }

  /**
   * @description refresh token으로 access token 재생성
   * @param refreshTokenDto
   * @param res
   *  @returns {accessToken}
   */
  @Public()
  @Post('auth/refresh')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    try {
      const user: User = req.user;
      const { accessToken, ...accessOption } =
        await this.authService.generateAccessToken(user);
      res.setHeader('Authorization', `Bearer ${accessToken}`);
      res.cookie('access_token', accessToken, accessOption);
      res.send({ user });
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh-token');
    }
  }

  /**
   * @description : 로그아웃
   * @param req
   * @param res
   * @returns {message: 'logout success'}
   */
  @Public()
  @Post('auth/logout')
  @UseGuards(JwtRefreshGuard)
  async logOut(@Req() req: any, @Res() res: Response): Promise<void> {
    await this.userService.removeRefreshToken(req.user.userId);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.send({ message: 'logout success' });
  }

  /**
   * @description 개인 프로필 출력
   * @param req
   * @returns
   */
  @UseGuards(RoleGuard)
  @Role(RoleType.USER)
  @Get('auth/profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @Public()
  @Get('auth/google')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  async googleAuth(@Req() _req: any): Promise<void> {}

  @Public()
  @Get('auth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLogin(
    @Req() req: GoogleRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SignInResult> {
    return await this.authService.googleLogin(req, res);
  }

  @Public()
  @Get('auth/kakao')
  @UseGuards(AuthGuard('kakao'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  async kakaoAuth(@Req() _req: any): Promise<void> {}

  @Public()
  @Get('auth/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin(
    @Req() req: KakaoRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SignInResult> {
    return await this.authService.kakaoLogin(req, res);
  }
}

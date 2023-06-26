import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { Public } from 'src/common/decorator/public.decorator';
import { UserService } from 'src/user/user.service';
import { Payload } from './interface/payload';
import { SignInResult } from './interface/sign-in-result';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

  /**
   * @description 로그인
   * @param loginDto 
   * @param res 
   * @returns 
   */
  @Public()
  @Post('auth/login')
  async signIn(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<SignInResult> {

    // DB에 저장된 암호호된 비밀번호와 동일한지 확인
    const payload: Payload = await this.authService.validateUser(loginDto);

    // 토근 생성
    const accessToken: string = await this.authService.generateAccessToken(payload);
    const refreshToken: string = await this.authService.generateRefreshToken(payload);

    // DB에 refresh token 저장
    await this.userService.setCurrentRefreshToken(payload.sub, refreshToken);

    res.setHeader('Authorization', `Bearer ${[accessToken, refreshToken]}`);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
    })

    const result: SignInResult = {
      message: 'login success',
      accessToken,
      refreshToken
    }
    return result
  }

  /**
   * @description 개인 프로필 출력
   * @param req
   * @returns 
   */
  // @UseGuards(AuthGuard)
  @Get('auth/profile')
  getProfile(@Request() req) {
    return req.user;
  }


}

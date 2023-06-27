import { Controller, Get, Post, Body, Res, Request, UnauthorizedException, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { Public } from 'src/common/decorator/public.decorator';
import { UserService } from 'src/user/user.service';
import { SignInResult } from './interface/sign-in-result';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Payload } from './interface/payload';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';



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


  @Public()
  @Post('auth/refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    try {
      const newAccessToken: string = await this.authService.refresh(refreshTokenDto.refreshToken)
      res.setHeader('Authorization', `Bearer ${newAccessToken}`);
      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
      });
      res.send({ newAccessToken });
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh-token');
    }
  }


  @Public()
  @Post('auth/logout')
  @UseGuards(JwtRefreshGuard)
  async logOut(@Req() req: any, @Res() res: Response) {
    await this.userService.removeRefreshToken(req.user.userId);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.send({
      message: 'logout success'
    })
  }

  /**
   * @description 개인 프로필 출력
   * @param req
   * @returns 
   */
  @Get('auth/profile')
  getProfile(@Request() req) {
    return req.user;
  }


}

import { Controller, Get, Post, Body, Res, UnauthorizedException, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { Public } from 'src/common/decorator/public.decorator';
import { UserService } from 'src/user/user.service';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { Role } from 'src/common/decorator/role.decorator';
import { RoleType } from 'src/user/enum/role-type.enum';
import { User } from 'src/user/entities/user.entity';
import { GoogleRequest, KakaoRequest } from './interface/auth.interface';
import { AuthGuard } from '@nestjs/passport';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { RefreshResDto, SigninResDto, UserInfoResDto } from './dto/res.dto';
import { SigninReqDto, SignupReqDto } from './dto/req.dto';
import { ApiPostResponse } from 'src/common/decorator/swagger.decorator';

@ApiTags('Auth')
@ApiExtraModels(UserInfoResDto, SigninResDto, RefreshResDto)
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

  @Public()
  @ApiPostResponse(UserInfoResDto)
  @Post('user/signup')
  async signup(@Body() { pw, name, role, email, nickname, photo, provider }: SignupReqDto): Promise<UserInfoResDto> {
    return await this.authService.signup(pw, name, role, email, nickname, photo, provider);
  }

  @Public()
  @Post('auth/signin')
  async signin(@Body() { email, pw }: SigninReqDto, @Res({ passthrough: true }) res: Response): Promise<SigninResDto> {
    return await this.authService.signin(email, pw, res);
  }

  @Public()
  @Post('auth/refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response): Promise<RefreshResDto> {
    try {
      const user: User = req.user;
      return await this.authService.refresh(user, res);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh-token');
    }
  }

  @Public()
  @Post('auth/logout')
  @UseGuards(JwtRefreshGuard)
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response): Promise<{ message: string }> {
    await this.authService.removeRefreshToken(req.user.userId);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'logout success' };
  }

  @UseGuards(RoleGuard)
  @Role(RoleType.USER)
  @Get('auth/profile')
  getProfile(@Req() req: any) {
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
  async googleLogin(@Req() req: GoogleRequest, @Res({ passthrough: true }) res: Response): Promise<UserInfoResDto> {
    return await this.authService.googleLogin(req, res);
  }

  @Public()
  @Get('auth/kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth(@Req() _req: any): Promise<void> {}

  @Public()
  @Get('auth/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin(@Req() req: KakaoRequest, @Res({ passthrough: true }) res: Response): Promise<UserInfoResDto> {
    return await this.authService.kakaoLogin(req, res);
  }
}

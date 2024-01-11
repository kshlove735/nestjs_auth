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
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { SigninResDto, SignupResDto } from './dto/res.dto';
import { SigninReqDto, SignupReqDto } from './dto/req.dto';
import { ApiPostResponse } from 'src/common/decorator/swagger.decorator';

@ApiTags('Auth')
@ApiExtraModels(SignupResDto, SigninResDto)
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

  @Public()
  @ApiPostResponse(SignupResDto)
  @Post('user/signup')
  async signup(@Body() { id, pw, name, role, email, nickname, photo, provider }: SignupReqDto): Promise<SignupResDto> {
    return await this.authService.signup(id, pw, name, role, email, nickname, photo, provider);
  }

  @Public()
  @Post('auth/signin')
  async signin(@Body() { id, pw }: SigninReqDto, @Res({ passthrough: true }) res: Response): Promise<SigninResDto> {
    return await this.authService.signin(id, pw, res);
  }

  @Public()
  @Post('auth/refresh')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response): Promise<void> {
    try {
      const user: User = req.user;
      const { accessToken, ...accessOption } = await this.authService.generateAccessToken(user);
      res.setHeader('Authorization', `Bearer ${accessToken}`);
      res.cookie('access_token', accessToken, accessOption);
      res.send({ user });
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh-token');
    }
  }

  @Public()
  @Post('auth/logout')
  @UseGuards(JwtRefreshGuard)
  async logOut(@Req() req: any, @Res() res: Response): Promise<void> {
    await this.userService.removeRefreshToken(req.user.userId);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.send({ message: 'logout success' });
  }

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
  async googleLogin(@Req() req: GoogleRequest, @Res({ passthrough: true }) res: Response): Promise<SignInResult> {
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
  async kakaoLogin(@Req() req: KakaoRequest, @Res({ passthrough: true }) res: Response): Promise<SignInResult> {
    return await this.authService.kakaoLogin(req, res);
  }
}

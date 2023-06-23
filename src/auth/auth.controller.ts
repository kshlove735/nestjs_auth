import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { Public } from 'src/common/decorator/public.decorator';
import { UserService } from 'src/user/user.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

  @Public()
  @Post('auth/login')
  async signIn(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.signIn(loginDto);
  }

  // @UseGuards(AuthGuard)
  @Get('auth/profile')
  getProfile(@Request() req) {
    return req.user;
  }


}

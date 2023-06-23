import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { Public } from 'src/common/decorator/public.decorator';
import { CreateUserDto } from './dto/create-user.dto';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }


  @Public()
  @Post('auth/signup')
  async signUp(@Body() createUserDto: CreateUserDto) {

  }

  // @HttpCode(HttpStatus.OK)
  @Public()
  @Post('auth/login')
  async signIn(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    console.log('야');
    return this.authService.signIn(loginDto);
  }

  // @UseGuards(AuthGuard)
  @Get('auth/profile')
  getProfile(@Request() req) {
    return req.user;
  }


}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'src/common/decorator/public.decorator';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) { }


  @Public()
  @Post('user/signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.userService.signUp(createUserDto)
  }
}

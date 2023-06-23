import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { User } from './entities/user.entity';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) { }


  @Public()
  @Post('user/signup')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.signUp(createUserDto)
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { Public } from 'src/common/decorator/public.decorator';
import { User } from './entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}
}

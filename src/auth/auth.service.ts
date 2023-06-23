import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService
  ) { }
  async signIn(loginDto: LoginDto) {
    const user: User = await this.userService.findUserById(loginDto.id);
    console.log(user);
    // TODO : 비밀번호 암호화 및 validate
    if (user?.pw !== loginDto.pw) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.userId, username: user.name }

    return {
      access_token: await this.jwtService.signAsync(payload)
    }
  }

}

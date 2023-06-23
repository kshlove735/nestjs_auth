import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService
  ) { }
  async signIn(loginDto: LoginDto) {
    const user: User = await this.userService.findUserById(loginDto.id);

    if (!user || ! await this.validatePw(loginDto.pw, user.pw)) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.userId, username: user.name }

    return {
      access_token: await this.jwtService.signAsync(payload)
    }
  }

  async validatePw(pw: string, hashPw: string): Promise<boolean> {
    return await bcrypt.compare(pw, hashPw);
  }

}

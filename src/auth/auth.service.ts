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

    // DB에 저장된 암호화된 pw 와 동일한지 확인
    if (!user || ! await this.validatePw(loginDto.pw, user.pw)) {
      throw new UnauthorizedException();
    }
    // payload 설정
    const payload = { sub: user.userId, username: user.name }

    // access token 설정
    return {
      access_token: await this.jwtService.signAsync(payload)
    }
  }

  async validatePw(pw: string, hashPw: string): Promise<boolean> {
    return await bcrypt.compare(pw, hashPw);
  }

}

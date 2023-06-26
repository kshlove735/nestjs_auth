import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'
import { Payload } from './interface/payload';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }
  async validateUser(loginDto: LoginDto): Promise<Payload> {
    const user: User = await this.userService.findUserById(loginDto.id);

    if (!user) throw new NotFoundException('User not found');
    if (! await this.validatePw(loginDto.pw, user.pw)) throw new BadRequestException('Invalid credentials');

    const payload: Payload = { sub: user.userId, username: user.name, email: user.email }

    return payload;
  }

  async validatePw(pw: string, hashPw: string): Promise<boolean> {
    return await bcrypt.compare(pw, hashPw);
  }

  async generateAccessToken(payload: Payload): Promise<string> {
    // JwtModule에서 동적으로 옵션 설정 지정
    return await this.jwtService.signAsync(payload);
  }

  async generateRefreshToken(payload: Payload): Promise<string> {
    return await this.jwtService.signAsync({ id: payload.sub }, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME')
    })
  }

}

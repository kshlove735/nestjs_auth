import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { PayloadDto } from 'src/auth/dto/function.dto';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  constructor(private readonly userService: UserService, private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          // main.ts에 app.use(cookieParser()); 설정해 줘야한다.
          // Cookies저장된 refresh_token return
          return request?.cookies?.refresh_token;
        },
      ]),
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
      // validate 함수 첫 번째 인자로 request를 전달 여부 확인
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: PayloadDto) {
    const refreshToken: string = req.cookies['refresh_token'];
    const user: User = await this.userService.getUserIfRefreshTokenMatches(refreshToken, payload.sub);
    return user;
  }
}

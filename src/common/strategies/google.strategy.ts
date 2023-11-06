import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      // clientID, clientSecret은 환경변수로 등록한 GOOGLE_CLIENT_ID, GOOGLE_SECRET 값 입력
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_SECRET'),
      // 구글 인증을 마치고 다시 돌아올 주소 입력.
      // 구글 앱을 구성하면서 사용자 인증 정보를 구성할때 입력한 Redirect URI값과 일치해야한다.
      callbackURL: configService.get('GOOGEL_CALLBACKURL'),
      scope: ['email', 'profile'],
    });
  }

  // 구글 로그인의 지속상태를 언제까지 유지할지를 세팅
  // 아래 설정은 로그인을 접속할때마다 사용자로부터 로그인을 매번 요청하도록 설정
  authorizationParams(): { [key: string]: string } {
    return {
      access_type: 'offline',
      prompt: 'consent',
    };
  }

  // 인증을 마치면 user를 구성해 반환하고 인증 오류가 발생하면 error를 전달
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    try {
      // console.log('accessToken', accessToken);
      // console.log('refreshToken', refreshToken);
      const { displayName, emails, photos } = profile;
      const user = {
        email: emails[0].value,
        name: displayName,
        photo: photos[0].value,
      };
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}

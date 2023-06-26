// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable } from '@nestjs/common';
// import { UserRepository } from '../user.repository';

// @Injectable()
// export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access-token') {
//     constructor(private readonly userRepository: UserRepository) {
//         super({
//             //Request에서 JWT 토큰을 추출하는 방법을 설정 -> Authorization에서 Bearer Token에 JWT 토큰을 담아 전송해야함
//             jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//             // false 경우 JWT가 Passport 모듈에 만료되지 않았는지 확인하는 책임을 위임함. 즉, 경로에 만료된 JWT가 제공되면 요청이 거부되고 401 Unauthorized응답 전송함
//             ignoreExpiration: false,
//             // token 서명 및 인증시 필요한 secret key. (대칭키 방식)
//             secretOrkey: 'access-secret-key',
//         });
//     }

//     async validate(payload: any) {

//     }
// }
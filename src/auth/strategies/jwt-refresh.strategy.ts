import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/user/user.service";
import { Payload } from "../interface/payload";
import { Request } from "express";
import { User } from "src/user/entities/user.entity";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request) => {
                    return request?.cookies?.refresh_token; // main.ts에 app.use(cookieParser()); 설정해 줘야한다.
                }
            ]),
            secretOrKey: configService.get('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        })
    }

    async validate(req: Request, payload: Payload) {
        const refreshToken: string = req.cookies['refresh_token'];
        const user: User = await this.userService.getUserIfRefreshTokenMatches(refreshToken, payload.sub);
        return user;
    }
}
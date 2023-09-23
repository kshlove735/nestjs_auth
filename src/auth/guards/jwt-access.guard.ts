import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "src/common/decorator/public.decorator";

@Injectable()
export class JwtAccessAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
        private configService: ConfigService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        if (isPublic) return true;

        const request: Request = context.switchToHttp().getRequest();
        const token: string = this.extractTokenFromHeader(request);
        if (!token) throw new UnauthorizedException();

        let payload;
        // provider에 따른 토근 유효성 검증
        try {
            payload = await this.jwtService.verifyAsync(token, { secret: this.configService.get('JWT_ACCESS_SECRET') });

            request['user'] = payload;
            // console.log(payload);
        } catch (e) {
            throw new UnauthorizedException(e.message);
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        //* request header의 authorization로 access token 전달할 때
        // const [type, token] = request.headers.authorization?.split(' ') ?? [];
        // return type === 'Bearer' ? token : undefined

        //* cookie로 access token 전달할 때
        const token = request.cookies['access_token'];
        return token
    }
}
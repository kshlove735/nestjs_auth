import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from 'rxjs';
import { User } from "src/user/entities/user.entity";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {


        // 요청 라우터에 설정된 키('role')에 대한 메타데이터 검색
        // 1.  @Role('ADMIN') -> 키 : 'role', 메타데이터 : 'ADMIN' 할당
        // 2. Reflector.get(키 'role', 요청 라우터)를 이용하여 요청 라우터에 설정된 키('role')에 대한 메타데이터('ADMIN') 검색
        const role = this.reflector.get<string>('role', context.getHandler());

        if (!role) return true


        const request = context.switchToHttp().getRequest();
        const user = request.user as User;


        return user && role === user.role;
    }
}
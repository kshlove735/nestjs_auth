import { RoleType } from "src/user/enum/role-type.enum";

export interface Payload {
    sub: number,
    username: string,
    email: string,
    role: RoleType
}
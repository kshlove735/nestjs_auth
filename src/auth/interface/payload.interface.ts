import { RoleType } from "src/user/enum/role-type.enum";

export interface Payload {
    sub: number,
    role: RoleType
}
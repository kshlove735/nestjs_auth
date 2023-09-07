
import { Provider } from "src/user/entities/user.entity";
import { RoleType } from "src/user/enum/role-type.enum";

export interface Payload {
    sub: number,
    role: RoleType,
    provider: Provider
}
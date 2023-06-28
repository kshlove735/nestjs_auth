import { SetMetadata } from "@nestjs/common";
import { RoleType } from "src/user/enum/role-type.enum";

export const Role = (role: RoleType): any => SetMetadata('role', role);
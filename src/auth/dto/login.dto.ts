import { PickType } from "@nestjs/mapped-types";
import { User } from "src/user/entities/user.entity";

export class LoginDto extends PickType(User, ['id'] as const) {

    pw: string;
}
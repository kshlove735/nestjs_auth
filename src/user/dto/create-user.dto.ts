import { PickType } from "@nestjs/mapped-types";
import { User } from "../entities/user.entity";

export class CreateUserDto extends PickType(User, ['id', 'pw', 'name', 'role', 'email', 'nickname',] as const) {

}

import { PickType } from "@nestjs/mapped-types";
import { User } from "src/user/entities/user.entity";
import { IsNotEmpty, IsString } from "class-validator"

export class LoginDto extends PickType(User, ['id'] as const) {

    @IsNotEmpty()
    @IsString()
    pw: string;
}
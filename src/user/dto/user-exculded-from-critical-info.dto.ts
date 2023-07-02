import { OmitType } from "@nestjs/mapped-types";
import { User } from "src/user/entities/user.entity";

export class UserExculdedFromCriticalInfoDto extends OmitType(User, ['pw', 'currentRefreshToken', 'currentRefreshTokenExp'] as const) { }
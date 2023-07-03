import { UserExculdedFromCriticalInfoDto } from "src/user/dto/user-exculded-from-critical-info.dto";

export interface SignInResult {
    message: string,
    user: UserExculdedFromCriticalInfoDto
}
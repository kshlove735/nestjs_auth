import { IsOptional, IsString } from "class-validator";

export class GoolgeLoginAuthOutPutDto {
    @IsOptional()
    @IsString()
    accessToken?: string;
}
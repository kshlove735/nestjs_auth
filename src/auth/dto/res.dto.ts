import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Provider } from 'src/user/entities/user.entity';
import { RoleType } from 'src/user/enum/role-type.enum';

export class UserInfoResDto {
  @ApiProperty({ required: true })
  userId: number;

  @ApiProperty({ required: true })
  email: string;

  @ApiProperty({ required: true })
  role: RoleType = RoleType.USER;

  @ApiProperty({ required: true })
  nickname: string;

  @ApiProperty({ required: true })
  photo: string;

  @ApiProperty({ required: true })
  provider: Provider;
}

export class SigninResDto {
  @ApiProperty({ required: true })
  accessToken: string;

  @ApiProperty({ required: true })
  refreshToken: string;
}

export class RefreshResDto {
  @ApiProperty({ required: true })
  accessToken: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { Provider } from 'src/user/entities/user.entity';
import { RoleType } from 'src/user/enum/role-type.enum';

export class SignupReqDto {
  @IsEmail()
  @ApiProperty({ required: true, example: 'kshlove735@gmail.com' })
  email: string;

  @IsString()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,30}$/)
  @ApiProperty({ required: true, example: 'User1!' })
  pw: string;

  @IsString()
  @ApiProperty({ required: true, example: '김승현' })
  name: string;

  @IsOptional()
  @IsEnum(RoleType)
  @ApiPropertyOptional({ example: 'USER' })
  role?: RoleType = RoleType.USER;

  @IsString()
  @ApiProperty({ required: true, example: 'nickname' })
  nickname: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'https://lh3.googleusercontent.com/a/ACg8ocJJ4zo4R_XU461ueWckY3_Hj1NFdgmZgvu4ylaTfM_y=s96-c',
  })
  photo?: string;

  @IsOptional()
  @IsEnum(Provider)
  @ApiPropertyOptional({ example: 'LOCAL' })
  provider?: Provider = Provider.LOCAL;
}

export class SigninReqDto {
  @IsEmail()
  @ApiProperty({ required: true, example: 'kshlove735@gmail.com' })
  email: string;

  @IsString()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,30}$/)
  @ApiProperty({ required: true, example: 'User1!' })
  pw: string;
}

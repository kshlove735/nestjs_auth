import { Provider } from 'src/user/entities/user.entity';
import { RoleType } from 'src/user/enum/role-type.enum';

export class AccessTokenWithOptionDto {
  accessToken: string;
  domain: string;
  path: string;
  httpOnly: boolean;
  maxAge: number;
}

export class RefreshTokenWithOptionDto {
  refreshToken: string;
  domain: string;
  path: string;
  httpOnly: boolean;
  maxAge: number;
}

export class PayloadDto {
  sub: number;
  role: RoleType;
  provider: Provider;
}

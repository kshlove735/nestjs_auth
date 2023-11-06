import { User } from 'src/user/entities/user.entity';

export interface SignInResult {
  message: string;
  user: User;
}

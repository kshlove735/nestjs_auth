import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule.register({}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: `${configService.get('JWT_ACCESS_EXPIRATION_TIME')}s` }
      }),
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, ConfigService, JwtRefreshStrategy], //* JwtRefreshStrategy 기억하자
  exports: [AuthService]
})
export class AuthModule { }

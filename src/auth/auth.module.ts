import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { TypeOrmExModule } from 'src/common/module/typeorm.module';
import { UserRepository } from 'src/user/user.repository';
import { JwtRefreshStrategy } from 'src/common/strategies/jwt-refresh.strategy';
import { GoogleStrategy } from 'src/common/strategies/google.strategy';
import { KakaoStrategy } from 'src/common/strategies/kakao.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule.register({}),
    TypeOrmModule.forFeature([User]),
    TypeOrmExModule.forCustomRepository([UserRepository]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: {
          // jwt의  payload의 exp 설정(쿠키의 expires와 다름)
          expiresIn: `${configService.get('JWT_ACCESS_EXPIRATION_TIME')}s`,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, ConfigService, JwtRefreshStrategy, GoogleStrategy, KakaoStrategy], //* JwtRefreshStrategy 기억하자
  exports: [AuthService],
})
export class AuthModule {}

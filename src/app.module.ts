import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { TestModule } from './test/test.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAccessAuthGuard } from './common/guards/jwt-access.guard';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AllExceptionsFilter } from './common/exceptions/all-exception.filter';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV == 'dev' ? '.env.dev' : '.env.prod',
      // 유효성 검사
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        NODE_ENV: Joi.string().valid('dev', 'prod').default('dev'),
        SQL_LOG: Joi.string().required(),
        PORT: Joi.number().required(),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_EXPIRATION_TIME: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_SECRET: Joi.string().required(),
        KAKAO_CLIENT_ID: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [],
        synchronize: true,
        keepConnectionAlive: true, // 핫 리로드 가능
        autoLoadEntities: true, // TypeOrmModule.forFeature를 통해 Entity 자동 수집
        namingStrategy: new SnakeNamingStrategy(),
        logging: configService.get('SQL_LOG'),
        bigNumberStrings: false,
        timezone: '+09:00',
      }),
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: 'silly',
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike('Nest', {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
        new winston.transports.DailyRotateFile({
          level: 'error',
          datePattern: 'YYYY-MM-DD',
          dirname: 'logs/error',
          filename: `%DATE%.log`,
          maxFiles: 30, // 30일치 로그 파일 저장
          maxSize: '20m',
          zippedArchive: false,
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
            winston.format.printf((info): string => {
              return `${info.timestamp} - ${info.level}, ${info.message} (${info.line})`;
            }),
          ),
        }),
        new winston.transports.DailyRotateFile({
          level: 'info',
          datePattern: 'YYYY-MM-DD',
          dirname: 'logs/info',
          filename: `%DATE%.log`,
          maxFiles: 30, // 30일치 로그 파일 저장
          maxSize: '20m',
          zippedArchive: false,
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
            winston.format.printf((info): string => {
              return `${info.timestamp} - ${info.level}, ${info.message} (${info.line})`;
            }),
          ),
        }),
        new winston.transports.DailyRotateFile({
          level: 'debug',
          datePattern: 'YYYY-MM-DD',
          dirname: 'logs/debug',
          filename: `%DATE%.log`,
          maxFiles: 30, // 30일치 로그 파일 저장
          maxSize: '20m',
          zippedArchive: false,
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
            winston.format.printf((info): string => {
              return `${info.timestamp} - ${info.level}, ${info.message} (${info.line})`;
            }),
          ),
        }),
      ],
    }),
    TestModule,
    UserModule,
    AuthModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [
    JwtService,
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAccessAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

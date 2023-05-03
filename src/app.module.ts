import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { TestModule } from './test/test.module';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: 'silly',
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike('Nest', {
              colors: true,
              prettyPrint: true,
            })
          )
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
              format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.printf((info) => {
              return `${info.timestamp} - ${info.level}, ${info.message} (${info.line})`
            })
          )
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
              format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.printf((info) => {
              return `${info.timestamp} - ${info.level}, ${info.message} (${info.line})`
            })
          )
        }), new winston.transports.DailyRotateFile({
          level: 'debug',
          datePattern: 'YYYY-MM-DD',
          dirname: 'logs/debug',
          filename: `%DATE%.log`,
          maxFiles: 30, // 30일치 로그 파일 저장
          maxSize: '20m',
          zippedArchive: false,
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.printf((info) => {
              return `${info.timestamp} - ${info.level}, ${info.message} (${info.line})`
            })
          )
        }),
      ]
    }),
    TestModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Swagger API')
    .setDescription('API 설명')
    .setVersion('1.0.0')
    .addBearerAuth() // Bearer 인증 설정
    .build();

  // swagger에서 새로고침해도 Authorization 계속 유지
  const customOption: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };

  const documnet = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documnet, customOption);

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  await app.listen(process.env.PORT);
}
bootstrap();

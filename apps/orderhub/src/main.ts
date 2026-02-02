import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { COOKIE_TABLE } from '@spaceorder/db/constants/cookieTable.const';

// BigInt serialization for JSON responses
BigInt.prototype.toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    // allowedHeaders: 'Content-Type, Authorization',
  });

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      exceptionFactory(errors) {
        return new BadRequestException(errors);
      },
    }),
  );

  app.use(cookieParser());

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Orderhub API')
    .setDescription('Space Order 주문 관리 시스템 API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth(
      COOKIE_TABLE.TABLE_SESSION,
      {
        type: 'apiKey',
        in: 'cookie',
        name: COOKIE_TABLE.TABLE_SESSION,
      },
      COOKIE_TABLE.TABLE_SESSION,
    )
    .addCookieAuth(
      COOKIE_TABLE.REFRESH,
      {
        type: 'apiKey',
        in: 'cookie',
        name: COOKIE_TABLE.REFRESH,
      },
      COOKIE_TABLE.REFRESH,
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      withCredentials: true,
    },
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 9090);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/docs`);
}
bootstrap();

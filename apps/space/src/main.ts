import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './root/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: false, // Throw error if non-whitelisted properties exist
      transform: true, // Automatically transform payloads to DTO instances
      exceptionFactory(errors) {
        return new BadRequestException(errors);
      },
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 9090);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();

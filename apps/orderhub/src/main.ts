import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

// BigInt를 JSON으로 직렬화할 수 있도록 설정
BigInt.prototype.toJSON = function () {
  return this.toString();
};

/**
 * Bootstraps and starts the NestJS application with global validation and Prisma exception handling.
 *
 * Sets up a global validation pipe that whitelists DTO properties, forbids non-whitelisted properties,
 * transforms payloads to DTO instances, and converts validation errors into BadRequestExceptions.
 * Applies the Prisma exception filter globally, reads the `PORT` configuration (defaulting to 9090),
 * starts the HTTP server on that port, and logs the application URL to the console.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Automatically transform payloads to DTO instances
      exceptionFactory(errors) {
        return new BadRequestException(errors);
      },
    }),
  );

  // Enable Prisma exception filter globally
  app.useGlobalFilters(new PrismaExceptionFilter());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 9090);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
import { NestFactory } from "@nestjs/core";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app/app.module";
import { COOKIE_TABLE } from "@spaceorder/db/constants/cookieTable.const";
import { RedisIoAdapter } from "./realtime/redis-io.adapter";
import { PRIVATE_HOST_ORIGIN } from "./realtime/realtime.constants";

// BigInt serialization for JSON responses
BigInt.prototype.toJSON = function (this: bigint) {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const isDev = configService.get("NODE_ENV") !== "production";
  app.enableCors({
    origin: isDev
      ? (
          origin: string | undefined,
          callback: (err: Error | null, allow?: boolean) => void
        ) => {
          // 개발 환경: localhost 및 사설 IP(모바일 테스트)에서 오는 요청 허용
          if (!origin || PRIVATE_HOST_ORIGIN.test(origin)) {
            callback(null, true);
          } else {
            callback(new Error("CORS blocked"));
          }
        }
      : [
          configService.getOrThrow<string>("ORDER_APP_URL"),
          configService.getOrThrow<string>("ORDERDESK_APP_URL"),
        ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      exceptionFactory(errors) {
        return new BadRequestException(errors);
      },
    })
  );

  app.use(cookieParser());

  const ioAdapter = new RedisIoAdapter(app);
  ioAdapter.connectToRedis();
  app.useWebSocketAdapter(ioAdapter);

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle("Orderhub API")
    .setDescription("Space Order 주문 관리 시스템 API 문서")
    .setVersion("1.0")
    .addBearerAuth()
    .addCookieAuth(
      COOKIE_TABLE.REFRESH,
      {
        type: "apiKey",
        in: "cookie",
        name: COOKIE_TABLE.REFRESH,
      },
      COOKIE_TABLE.REFRESH
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: {
      withCredentials: true,
    },
  });

  const port = configService.get<number>("PORT", 9090);

  await app.listen(port, "0.0.0.0");
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/docs`);
}
void bootstrap();

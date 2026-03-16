import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";
import Redlock from "redlock";

export const REDIS_CLIENT = "REDIS_ORDERHUB";
export const REDLOCK_CLIENT = "REDLOCK_CLIENT";

export const redisProvider = {
  provide: REDIS_CLIENT,
  useFactory: (configService: ConfigService) => {
    return new Redis({
      host: configService.get<string>("REDIS_HOST", "localhost"),
      port: configService.get<number>("REDIS_PORT", 6379),
      password: configService.get<string>("REDIS_PASSWORD"),
    });
  },
  inject: [ConfigService],
};

export const redlockProvider = {
  provide: REDLOCK_CLIENT,
  useFactory: (redis: Redis) => {
    return new Redlock([redis], {
      retryCount: 3,
      retryDelay: 200,
    });
  },
  inject: [REDIS_CLIENT],
};

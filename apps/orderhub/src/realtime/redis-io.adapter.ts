import { IoAdapter } from "@nestjs/platform-socket.io";
import { INestApplicationContext } from "@nestjs/common";
import { Server, ServerOptions } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import type { Redis } from "ioredis";
import { REDIS_PUB_CLIENT, REDIS_SUB_CLIENT } from "../redis/redis.module";

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor?: ReturnType<typeof createAdapter>;

  constructor(private readonly app: INestApplicationContext) {
    super(app);
  }

  connectToRedis(): void {
    const pub = this.app.get<Redis>(REDIS_PUB_CLIENT);
    const sub = this.app.get<Redis>(REDIS_SUB_CLIENT);
    this.adapterConstructor = createAdapter(pub, sub);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server: Server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"],
        credentials: true,
      },
    });
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}

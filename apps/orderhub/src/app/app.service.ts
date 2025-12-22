import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // for test
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

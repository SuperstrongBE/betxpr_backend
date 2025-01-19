import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class LoggingService extends Logger {
  private redis: Redis;

  constructor(private configService: ConfigService) {
    super();
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'redis'),
      port: this.configService.get('REDIS_PORT', 6379),
    });
  }

  async log(message: string, context?: string) {
    super.log(message, context);
    await this.storeLog('info', message, context);
  }

  async error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context);
    await this.storeLog('error', message, context, trace);
  }

  async warn(message: string, context?: string) {
    super.warn(message, context);
    await this.storeLog('warn', message, context);
  }

  async debug(message: string, context?: string) {
    super.debug(message, context);
    await this.storeLog('debug', message, context);
  }

  private async storeLog(
    level: 'info' | 'error' | 'warn' | 'debug',
    message: string,
    context?: string,
    trace?: string,
  ) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      trace,
    };

    await this.redis.lpush('application_logs', JSON.stringify(logEntry));
    await this.redis.ltrim('application_logs', 0, 9999); // Keep last 10000 logs
  }

  async getLogs(limit = 100): Promise<any[]> {
    const logs = await this.redis.lrange('application_logs', 0, limit - 1);
    return logs.map(log => JSON.parse(log));
  }
}
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(
    @InjectQueue('blockchain-events') private readonly eventsQueue: Queue,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const client = this.eventsQueue.client;
      const isConnected = client.status === 'ready';

      return this.getStatus(key, isConnected);
    } catch (error) {
      return this.getStatus(key, false, { message: error.message });
    }
  }
}
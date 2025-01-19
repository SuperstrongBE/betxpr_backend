import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './redis.health';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [TerminusModule, QueueModule],
  controllers: [HealthController],
  providers: [RedisHealthIndicator],
})
export class HealthModule {}
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockchainEvent } from './blockchain.entity';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { Timeout } from '@nestjs/schedule';
import { CircuitBreaker } from 'opossum';
import Redis from 'ioredis';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private supabase;
  private redis: Redis;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(
    @InjectRepository(BlockchainEvent)
    private eventRepository: Repository<BlockchainEvent>,
    private configService: ConfigService,
    private metricsService: MetricsService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );

    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'redis'),
      port: this.configService.get('REDIS_PORT', 6379),
    });

    this.circuitBreaker = new CircuitBreaker(async (fn) => fn(), {
      resetTimeout: 10000, // 10 seconds
      errorThresholdPercentage: 50,   // Percentage of errors before opening
      timeout: 5000,       // 5 seconds timeout for operations
    });
  }

  @Timeout(5000)
  private async saveToSupabase(event: any) {
    const action = async () => {
      const { data, error } = await this.supabase
        .from('blockchain_events')
        .insert([event]);

      if (error) {
        this.logger.error('Error saving to Supabase:', error);
        throw error;
      }

      return data;
    };

    return this.circuitBreaker.fire(action);
  }

  async processEvent(event: any) {
    try {
      // First, check if we've already processed this event
      const eventKey = `event:${event.network}:${event.transactionHash}`;
      const exists = await this.redis.exists(eventKey);
      
      if (exists) {
        this.logger.debug(`Event ${eventKey} already processed, skipping`);
        return;
      }

      // Save to Supabase with circuit breaker
      try {
        await this.saveToSupabase(event);
        this.metricsService.setCircuitBreakerState('closed');
      } catch (error) {
        this.logger.error('Failed to save to Supabase (circuit breaker may be open):', error);
        // Store failed events in Redis for retry
        await this.redis.lpush('failed_events', JSON.stringify(event));
        this.metricsService.setCircuitBreakerState('open');
        throw error;
      }

      // Mark event as processed
      await this.redis.set(eventKey, '1', 'EX', 86400); // Expire after 24 hours

      // Update metrics
      this.metricsService.incrementEventsProcessed(event.network);
      const queueSize = await this.redis.llen('failed_events');
      this.metricsService.setQueueSize(queueSize);

      return event;
    } catch (error) {
      this.logger.error('Error processing blockchain event:', error);
      throw error;
    }
  }

  async retryFailedEvents() {
    const failedEvent = await this.redis.rpop('failed_events');
    if (failedEvent) {
      try {
        const event = JSON.parse(failedEvent);
        await this.saveToSupabase(event);
        this.logger.log(`Successfully retried failed event: ${event.transactionHash}`);
      } catch (error) {
        this.logger.error('Failed to retry event:', error);
        // Put it back in the queue
        await this.redis.lpush('failed_events', failedEvent);
      }
    }
  }
}
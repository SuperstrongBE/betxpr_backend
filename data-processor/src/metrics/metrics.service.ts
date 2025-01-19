import { Injectable } from '@nestjs/common';
import { Counter, Gauge } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('blockchain_events_total')
    private readonly eventsCounter: Counter<string>,
    @InjectMetric('queue_size')
    private readonly queueSizeGauge: Gauge<string>,
    @InjectMetric('circuit_breaker_state')
    private readonly circuitBreakerGauge: Gauge<string>,
  ) {}

  incrementEventsProcessed(network: string) {
    this.eventsCounter.inc({ network });
  }

  setQueueSize(size: number) {
    this.queueSizeGauge.set(size);
  }

  setCircuitBreakerState(state: 'open' | 'closed' | 'half-open') {
    this.circuitBreakerGauge.set({
      state,
    }, state === 'closed' ? 1 : 0);
  }
}
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('blockchain-events') private readonly eventsQueue: Queue,
  ) {}

  async addEvent(event: any) {
    return this.eventsQueue.add('process-event', event, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  async getQueueStatus() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.eventsQueue.getWaitingCount(),
      this.eventsQueue.getActiveCount(),
      this.eventsQueue.getCompletedCount(),
      this.eventsQueue.getFailedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
    };
  }
}
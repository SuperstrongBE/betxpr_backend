import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';
import { BlockchainService } from './blockchain.service';
import { QueueService } from '../queue/queue.service';

@Controller()
export class BlockchainController {
  private readonly logger = new Logger(BlockchainController.name);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly queueService: QueueService,
  ) {}

  @MessagePattern('blockchain_event')
  async handleBlockchainEvent(@Payload() event: any) {
    this.logger.debug(`Received blockchain event: ${event.transactionHash}`);
    return this.queueService.addEvent(event);
  }

  @Cron('*/5 * * * * *') // Run every 5 seconds
  async retryFailedEvents() {
    await this.blockchainService.retryFailedEvents();
  }
}
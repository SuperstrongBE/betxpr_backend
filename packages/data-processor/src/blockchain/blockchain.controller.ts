import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';
import { BlockchainService } from './blockchain.service';
import { QueueService } from '../queue/queue.service';
import { BlockchainEventDto, EthereumEventDto, XPREventDto } from '@betxpr/shared-types';

@Controller()
export class BlockchainController {
  private readonly logger = new Logger(BlockchainController.name);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly queueService: QueueService,
  ) {}

  @MessagePattern('blockchain_event')
  async handleBlockchainEvent(@Payload() event: BlockchainEventDto) {
    this.logger.debug(`Received blockchain event: ${event.transactionHash} from ${event.network}`);
    return this.queueService.addEvent(event);
  }

  @Cron('*/5 * * * * *') // Run every 5 seconds
  async retryFailedEvents() {
    await this.blockchainService.retryFailedEvents();
  }
}
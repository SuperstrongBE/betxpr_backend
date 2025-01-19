import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { BlockchainService } from '../blockchain/blockchain.service';

@Processor('blockchain-events')
export class QueueProcessor {
  private readonly logger = new Logger(QueueProcessor.name);

  constructor(private readonly blockchainService: BlockchainService) {}

  @Process('process-event')
  async processEvent(job: Job) {
    this.logger.debug(`Processing event job ${job.id}`);
    try {
      await this.blockchainService.processEvent(job.data);
      this.logger.debug(`Successfully processed event job ${job.id}`);
    } catch (error) {
      this.logger.error(`Failed to process event job ${job.id}:`, error);
      throw error;
    }
  }
}
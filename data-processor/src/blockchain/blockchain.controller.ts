import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BlockchainService } from './blockchain.service';

@Controller()
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @MessagePattern('blockchain_event')
  async handleBlockchainEvent(@Payload() event: any) {
    return this.blockchainService.processEvent(event);
  }
}
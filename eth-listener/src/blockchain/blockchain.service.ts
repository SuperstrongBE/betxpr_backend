import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private provider: ethers.providers.JsonRpcProvider;
  private client: ClientProxy;

  constructor(private configService: ConfigService) {
    this.provider = new ethers.providers.JsonRpcProvider(
      this.configService.get<string>('ETH_RPC_URL'),
    );

    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 3002,
      },
    });
  }

  async onModuleInit() {
    await this.startListening();
  }

  private async startListening() {
    const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');
    const contractABI = this.configService.get<string>('CONTRACT_ABI');

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      this.provider,
    );

    contract.on('*', async (event) => {
      const formattedEvent = {
        eventName: event.event,
        args: event.args,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: new Date(),
        network: 'ethereum',
      };

      await this.client.emit('blockchain_event', formattedEvent);
    });
  }
}
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { EthereumEventDto, BlockchainNetwork } from '@betxpr/shared-types';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private provider: ethers.JsonRpcProvider;
  private client: ClientProxy;

  constructor(private configService: ConfigService) {
    this.provider = new ethers.JsonRpcProvider(
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
      const block = await this.provider.getBlock(event.blockNumber);
      const formattedEvent = new EthereumEventDto();
      formattedEvent.eventName = event.event;
      formattedEvent.args = event.args;
      formattedEvent.blockNumber = event.blockNumber;
      formattedEvent.transactionHash = event.transactionHash;
      formattedEvent.timestamp = new Date(block.timestamp * 1000);
      formattedEvent.network = BlockchainNetwork.ETHEREUM;
      formattedEvent.contractAddress = event.address;
      formattedEvent.logIndex = event.logIndex;
      formattedEvent.blockHash = event.blockHash;

      await this.client.emit('blockchain_event', formattedEvent);
    });
  }
}
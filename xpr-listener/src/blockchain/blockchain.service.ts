import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { JsonRpc } from '@proton/js';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private rpc: JsonRpc;
  private client: ClientProxy;

  constructor(private configService: ConfigService) {
    this.rpc = new JsonRpc(this.configService.get<string>('XPR_RPC_URL'));

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
    const contractAccount = this.configService.get<string>('CONTRACT_ACCOUNT');
    
    // Poll for new actions every 500ms
    setInterval(async () => {
      try {
        const actions = await this.rpc.history_get_actions(contractAccount);
        
        for (const action of actions.actions) {
          const formattedEvent = {
            eventName: action.action_trace.act.name,
            args: action.action_trace.act.data,
            blockNumber: action.block_num,
            transactionHash: action.action_trace.trx_id,
            timestamp: new Date(action.block_time),
            network: 'xpr',
          };

          await this.client.emit('blockchain_event', formattedEvent);
        }
      } catch (error) {
        console.error('Error fetching XPR actions:', error);
      }
    }, 500);
  }
}
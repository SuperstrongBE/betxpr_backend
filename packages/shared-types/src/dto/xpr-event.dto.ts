import { IsString, IsNumber, IsObject } from 'class-validator';
import { BlockchainEventDto } from './blockchain-event.dto';

export class XPREventDto extends BlockchainEventDto {
  @IsString()
  contractAccount: string;

  @IsString()
  actionName: string;

  @IsObject()
  authorization: {
    actor: string;
    permission: string;
  };

  @IsNumber()
  globalSequence: number;
}
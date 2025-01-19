import { IsString, IsNumber, IsDate, IsObject, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum BlockchainNetwork {
  ETHEREUM = 'ethereum',
  XPR = 'xpr',
}

export class BlockchainEventDto {
  @IsString()
  eventName: string;

  @IsObject()
  args: Record<string, any>;

  @IsNumber()
  blockNumber: number;

  @IsString()
  transactionHash: string;

  @Type(() => Date)
  @IsDate()
  timestamp: Date;

  @IsEnum(BlockchainNetwork)
  network: BlockchainNetwork;
}

export class EthereumEventDto extends BlockchainEventDto {
  @IsString()
  contractAddress: string;

  @IsNumber()
  logIndex: number;

  @IsString()
  blockHash: string;
}
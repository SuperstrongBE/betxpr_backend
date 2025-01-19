import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { BlockchainNetwork } from '@betxpr/shared-types';

@Entity('blockchain_events')
export class BlockchainEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventName: string;

  @Column('jsonb')
  args: Record<string, any>;

  @Column()
  blockNumber: number;

  @Column()
  transactionHash: string;

  @Column({
    type: 'enum',
    enum: BlockchainNetwork,
  })
  network: BlockchainNetwork;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ nullable: true })
  contractAddress?: string;

  @Column({ nullable: true })
  logIndex?: number;

  @Column({ nullable: true })
  blockHash?: string;

  @Column({ nullable: true })
  contractAccount?: string;

  @Column({ nullable: true })
  actionName?: string;

  @Column('jsonb', { nullable: true })
  authorization?: {
    actor: string;
    permission: string;
  };

  @Column({ nullable: true })
  globalSequence?: number;
}
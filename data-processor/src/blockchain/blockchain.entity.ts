import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('blockchain_events')
export class BlockchainEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventName: string;

  @Column('jsonb')
  args: any;

  @Column()
  blockNumber: number;

  @Column()
  transactionHash: string;

  @Column()
  network: string;

  @CreateDateColumn()
  timestamp: Date;
}
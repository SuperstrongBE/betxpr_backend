import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockchainEvent } from './blockchain.entity';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlockchainService {
  private supabase;

  constructor(
    @InjectRepository(BlockchainEvent)
    private eventRepository: Repository<BlockchainEvent>,
    private configService: ConfigService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
  }

  async processEvent(event: any) {
    try {
      // Save to PostgreSQL via TypeORM
      const savedEvent = await this.eventRepository.save(event);

      // Also save to Supabase
      const { data, error } = await this.supabase
        .from('blockchain_events')
        .insert([event]);

      if (error) {
        console.error('Error saving to Supabase:', error);
      }

      return savedEvent;
    } catch (error) {
      console.error('Error processing blockchain event:', error);
      throw error;
    }
  }
}
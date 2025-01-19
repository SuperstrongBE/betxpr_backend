import { Controller, Get, Query } from '@nestjs/common';
import { LoggingService } from './logging.service';

@Controller('logs')
export class LoggingController {
  constructor(private readonly loggingService: LoggingService) {}

  @Get()
  async getLogs(@Query('limit') limit = '100') {
    return this.loggingService.getLogs(parseInt(limit, 10));
  }
}
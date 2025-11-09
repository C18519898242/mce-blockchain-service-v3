/**
 * NestJS application controller
 */

import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('index')
  getIndex(): string {
    return 'mce-blockchain-service-v3';
  }

  @Get()
  getRoot(): string {
    return 'mce-blockchain-service-v3';
  }
}

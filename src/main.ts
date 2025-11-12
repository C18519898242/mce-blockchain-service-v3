/**
 * Main entry point for MCE Blockchain Service
 */

import * as dotenv from 'dotenv';
import { App } from './interface/app';
import { indexRoutes } from './interface/routes/index.routes';
import { createAddressRoutes } from './interface/routes/address.routes';
import { AddressApplicationService } from './services/address.service';
import { BalanceApplicationService } from './services/balance.service';
import { getAddressService } from './domain/address';
import { logger } from './infrastructure/logging/logger';
import { SolanaBlockchainAdapter } from './infrastructure/api/solana.adapter';
import { CoinRepository } from './infrastructure/persistence/redis/CoinRepository';
import { RedisService } from './infrastructure/redis/redis.service';

// Load environment variables
dotenv.config();

logger.info('MCE Blockchain Service V3 - Starting up...');

async function main(): Promise<void> {
  // Initialize infrastructure dependencies
  const redisService = new RedisService(logger);
  await redisService.connect();
  
  // Initialize blockchain adapter
  const blockchainAdapter = new SolanaBlockchainAdapter();
  
  // Initialize repositories
  const coinRepository = new CoinRepository(redisService, logger);
  
  // Initialize services
  const addressDomainService = getAddressService();
  const addressApplicationService = new AddressApplicationService(addressDomainService);
  const balanceApplicationService = new BalanceApplicationService(blockchainAdapter, coinRepository);
  
  // Create app with injected dependencies
  const app = new App(balanceApplicationService);
  
  // Use routes module
  app.app.use('/', indexRoutes);
  app.app.use('/api/address', createAddressRoutes(addressApplicationService));
  
  app.listen();
  logger.info('Service initialized successfully');
}

main().catch(error => {
  logger.error('Failed to start service', {
    type: 'startup_error',
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

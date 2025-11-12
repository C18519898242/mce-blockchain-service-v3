/**
 * Main entry point for MCE Blockchain Service
 */

import * as dotenv from 'dotenv';
import { App } from './interface/app';
import { indexRoutes } from './interface/routes/index.routes';
import { createAddressRoutes } from './interface/routes/address.routes';
import { AddressApplicationService } from './services/address.service';
import { getAddressService } from './domain/address';
import { logger } from './infrastructure/logging/logger';

// Load environment variables
dotenv.config();

logger.info('MCE Blockchain Service V3 - Starting up...');

async function main(): Promise<void> {
  const app = new App();
  
  // Initialize services
  const addressDomainService = getAddressService();
  const addressApplicationService = new AddressApplicationService(addressDomainService);
  
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

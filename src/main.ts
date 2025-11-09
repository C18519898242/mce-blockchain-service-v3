/**
 * Main entry point for MCE Blockchain Service
 */

import { App } from './interface/app';
import { indexRoutes } from './interface/routes/index.routes';
import { logger } from './infrastructure/logging/logger';

logger.info('MCE Blockchain Service V3 - Starting up...');

async function main(): Promise<void> {
  const app = new App();
  
  // Use routes module
  app.app.use('/', indexRoutes);
  
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

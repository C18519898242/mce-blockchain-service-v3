/**
 * Main entry point for MCE Blockchain Service
 */

import { App } from './interface/app';
import { Request, Response } from 'express';
import { logger } from './infrastructure/logging/logger';

logger.info('MCE Blockchain Service V3 - Starting up...');

async function main(): Promise<void> {
  const app = new App();
  
  // Add index route
  app.app.get('/index', (req: Request, res: Response) => {
    logger.info('Index route accessed', {
      type: 'route_access',
      route: '/index',
      method: 'GET',
      ip: req.ip || req.connection.remoteAddress
    });
    res.send('mce-blockchain-service-v3');
  });
  
  app.app.get('/', (req: Request, res: Response) => {
    logger.info('Root route accessed', {
      type: 'route_access',
      route: '/',
      method: 'GET',
      ip: req.ip || req.connection.remoteAddress
    });
    res.send('mce-blockchain-service-v3');
  });
  
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

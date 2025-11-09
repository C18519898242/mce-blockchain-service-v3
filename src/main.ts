/**
 * Main entry point for MCE Blockchain Service
 */

import { App } from './interface/app';
import { Request, Response } from 'express';

console.log('MCE Blockchain Service V3 - Starting up...');

async function main(): Promise<void> {
  const app = new App();
  
  // Add index route
  app.app.get('/index', (req: Request, res: Response) => {
    res.send('mce-blockchain-service-v3');
  });
  
  app.app.get('/', (req: Request, res: Response) => {
    res.send('mce-blockchain-service-v3');
  });
  
  app.listen();
  console.log('Service initialized successfully');
}

main().catch(error => {
  console.error('Failed to start service:', error);
  process.exit(1);
});

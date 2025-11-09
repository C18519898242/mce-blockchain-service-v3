/**
 * Express application setup and configuration
 */

import express from 'express';
import { errorMiddleware } from './middleware/error.middleware';
import { requestLoggingMiddleware } from './middleware/request-logging.middleware';
import { logger } from '../infrastructure/logging/logger';

export class App {
  public app: express.Application;
  public port: number;

  constructor() {
    this.app = express();
    this.port = 9001;
    this.initializeMiddlewares();
  }

  private initializeMiddlewares(): void {
    // Request logging middleware (must be first)
    this.app.use(requestLoggingMiddleware);
    
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Error handling middleware (must be last)
    this.app.use(errorMiddleware);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      logger.info(`Server started successfully`, {
        port: this.port,
        environment: process.env.NODE_ENV || 'development',
        service: 'mce-blockchain-service-v3'
      });
    });
  }
}

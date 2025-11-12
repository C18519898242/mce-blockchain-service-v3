/**
 * Express application setup and configuration
 */

import express from 'express';
import { errorMiddleware } from './middleware/error.middleware';
import { requestLoggingMiddleware } from './middleware/request-logging.middleware';
import { logger } from '@infrastructure/logging/logger';
import { appConfig } from '@config/app.config';
import { BalanceApplicationService } from '@services/balance.service';
import { createBalanceRoutes } from './routes/balance.routes';

export class App {
  public app: express.Application;
  public port: number;
  private balanceService: BalanceApplicationService;

  /**
   * Constructor for App class
   * @param balanceService Balance application service instance
   */
  constructor(balanceService: BalanceApplicationService) {
    this.app = express();
    this.port = appConfig.port;
    
    // Use the injected balance service
    this.balanceService = balanceService;
    
    logger.info('Application configuration loaded', {
      portFromEnv: process.env.PORT,
      configPort: appConfig.port,
      nodeEnv: process.env.NODE_ENV
    });
    
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {
    // Request logging middleware (must be first)
    this.app.use(requestLoggingMiddleware);
    
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }
  
  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        service: 'mce-blockchain-service-v3',
        status: 'healthy',
        timestamp: new Date().toISOString()
      });
    });
    
    // Register balance routes
    const balanceRouter = createBalanceRoutes(this.balanceService);
    this.app.use('/api/balance', balanceRouter);
    
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

/**
 * Express application setup and configuration
 */

import express from 'express';
import { errorMiddleware } from './middleware/error.middleware';

export class App {
  public app: express.Application;
  public port: number;

  constructor() {
    this.app = express();
    this.port = 9001;
    this.initializeMiddlewares();
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Error handling middleware (must be last)
    this.app.use(errorMiddleware);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}

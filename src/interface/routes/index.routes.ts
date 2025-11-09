/**
 * Index routes
 */

import { Router, Request, Response } from 'express';
import { logger } from '../../infrastructure/logging/logger';

const router = Router();

// Root route
router.get('/', (req: Request, res: Response) => {
  logger.info('Root route accessed', {
    type: 'route_access',
    route: '/',
    method: 'GET',
    ip: req.ip || req.connection.remoteAddress
  });
  res.send('mce-blockchain-service-v3');
});

// Index route
router.get('/index', (req: Request, res: Response) => {
  logger.info('Index route accessed', {
    type: 'route_access',
    route: '/index',
    method: 'GET',
    ip: req.ip || req.connection.remoteAddress
  });
  res.send('mce-blockchain-service-v3');
});

export { router as indexRoutes };

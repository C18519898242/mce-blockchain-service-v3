/**
 * Global error handling middleware
 */

import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  console.error('Error:', error);
  
  res.status(500).json({
    message: 'Internal Server Error',
    timestamp: new Date().toISOString(),
    path: req.path,
  });
}

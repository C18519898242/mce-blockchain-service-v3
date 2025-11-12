import { Router } from 'express';
import { BalanceApplicationService } from '../../services/balance.service';
import { BalanceRequestDTO, BalanceResponseDTO, createBalanceResponse } from '../dto/balance.dto';
import { validateBalance } from '../middleware/validation.middleware';

/**
 * Balance Routes
 * 
 * Express router for balance-related endpoints.
 * Provides REST API for querying blockchain address balances.
 */
export class BalanceRoutes {
  private router: Router;
  private balanceService: BalanceApplicationService;

  /**
   * Constructor
   * 
   * @param balanceService The balance application service
   */
  constructor(balanceService: BalanceApplicationService) {
    this.router = Router();
    this.balanceService = balanceService;
    this.initializeRoutes();
  }

  /**
   * Get the router instance
   * 
   * @returns Express router with balance routes configured
   */
  public getRouter(): Router {
    return this.router;
  }

  /**
   * Initialize balance routes
   * 
   * Sets up all balance-related endpoints with their handlers.
   */
  private initializeRoutes(): void {
    /**
     * GET /api/balance/:coinKey/:address
     * 
     * Get balance for a specific address and coin.
     * 
     * @param coinKey The unique identifier of the coin (e.g., SOLANA_USDT)
     * @param address The blockchain address to query balance for
     * @returns Balance information or error response
     */
    this.router.get('/:coinKey/:address', validateBalance, async (req, res) => {
      try {
        const { coinKey, address } = req.params;
        
        // Create request DTO
        const request: BalanceRequestDTO = {
          address: decodeURIComponent(address),
          coinKey: decodeURIComponent(coinKey)
        };

        // Query balance
        const addressBalance = await this.balanceService.getBalance(
          request.address,
          request.coinKey
        );

        if (!addressBalance) {
          return res.status(404).json({
            success: false,
            error: 'Coin configuration not found',
            coinKey: request.coinKey
          });
        }

        // Create response DTO
        const response: BalanceResponseDTO = createBalanceResponse(addressBalance);

        res.json({
          success: true,
          data: response
        });

      } catch (error) {
        console.error('Error querying balance:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: 'Failed to query balance'
        });
      }
    });

    /**
     * GET /api/balance/health
     * 
     * Health check endpoint for balance service.
     * 
     * @returns Service health status
     */
    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        service: 'balance-service',
        status: 'healthy',
        timestamp: new Date().toISOString()
      });
    });
  }
}

/**
 * Factory function to create balance routes
 * 
 * @param balanceService The balance application service
 * @returns Configured balance routes
 */
export function createBalanceRoutes(balanceService: BalanceApplicationService): Router {
  const balanceRoutes = new BalanceRoutes(balanceService);
  return balanceRoutes.getRouter();
}

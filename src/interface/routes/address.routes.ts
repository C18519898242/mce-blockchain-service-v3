/**
 * Address Routes
 * 
 * Express router for address-related endpoints.
 * Provides REST API for generating and validating blockchain addresses.
 */
import { Router } from 'express';
import { AddressApplicationService } from '../../services/address.service';
import {
  AddressGenerateRequestDTO,
  AddressGenerateResponseDTO,
  AddressValidateRequestDTO,
  AddressValidateResponseDTO,
  validateAddressGenerateRequest,
  validateAddressValidateRequest,
  createAddressGenerateResponse,
  createAddressValidateResponse
} from '../dto/address.dto';
import { logger } from '@infrastructure/logging/logger';

/**
 * Address Routes
 * 
 * Express router for address-related endpoints.
 */
export class AddressRoutes {
  private router: Router;
  private addressService: AddressApplicationService;

  /**
   * Constructor
   * 
   * @param addressService The address application service
   */
  constructor(addressService: AddressApplicationService) {
    this.router = Router();
    this.addressService = addressService;
    this.initializeRoutes();
  }

  /**
   * Get the router instance
   * 
   * @returns Express router with address routes configured
   */
  public getRouter(): Router {
    return this.router;
  }

  /**
   * Initialize address routes
   * 
   * Sets up all address-related endpoints with their handlers.
   */
  private initializeRoutes(): void {
    /**
     * POST /api/address/generate
     * 
     * Generate a blockchain address from a public key.
     * 
     * @param publicKey The public key to generate address from
     * @param blockchain The blockchain identifier (e.g., 'SOLANA')
     * @returns Generated address or error response
     */
    this.router.post('/generate', async (req, res) => {
      try {
        // Extract request body
        const request: AddressGenerateRequestDTO = req.body;

        // Validate request
        const validation = validateAddressGenerateRequest(request);
        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            error: 'Invalid request parameters',
            details: validation.errors
          });
        }

        // Log request
        logger.info('Generating address request', {
          blockchain: request.blockchain,
          publicKey: request.publicKey.slice(0, 8) + '...' // Log only first 8 chars for security
        });

        // Generate address
        const address = this.addressService.generateAddress(
          request.publicKey,
          request.blockchain
        );

        // Create response
        const response: AddressGenerateResponseDTO = createAddressGenerateResponse(
          address,
          request.blockchain,
          request.publicKey
        );

        // Log response
        logger.info('Address generated successfully', {
          blockchain: request.blockchain,
          address: address
        });

        res.json({
          success: true,
          data: response
        });

      } catch (error) {
        logger.error('Error generating address:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: 'Failed to generate address'
        });
      }
    });

    /**
     * POST /api/address/validate
     * 
     * Validate a blockchain address format.
     * 
     * @param address The blockchain address to validate
     * @param blockchain The blockchain identifier (e.g., 'SOLANA')
     * @returns Validation result or error response
     */
    this.router.post('/validate', async (req, res) => {
      try {
        // Extract request body
        const request: AddressValidateRequestDTO = req.body;

        // Validate request
        const validation = validateAddressValidateRequest(request);
        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            error: 'Invalid request parameters',
            details: validation.errors
          });
        }

        // Log request
        logger.info('Validating address request', {
          blockchain: request.blockchain,
          address: request.address
        });

        // Validate address
        const isValid = this.addressService.validateAddress(
          request.address,
          request.blockchain
        );

        // Create response
        const response: AddressValidateResponseDTO = createAddressValidateResponse(
          request.address,
          request.blockchain,
          isValid
        );

        // Log response
        logger.info('Address validation completed', {
          blockchain: request.blockchain,
          address: request.address,
          isValid: isValid
        });

        res.json({
          success: true,
          data: response
        });

      } catch (error) {
        logger.error('Error validating address:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: 'Failed to validate address'
        });
      }
    });

    /**
     * GET /api/address/health
     * 
     * Health check endpoint for address service.
     * 
     * @returns Service health status
     */
    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        service: 'address-service',
        status: 'healthy',
        timestamp: new Date().toISOString()
      });
    });
  }
}

/**
 * Factory function to create address routes
 * 
 * @param addressService The address application service
 * @returns Configured address routes
 */
export function createAddressRoutes(addressService: AddressApplicationService): Router {
  const addressRoutes = new AddressRoutes(addressService);
  return addressRoutes.getRouter();
}
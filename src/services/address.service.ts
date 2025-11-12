import { AddressDomainService } from '@domain/address/AddressService';

/**
 * Address Application Service
 * 
 * Service layer for handling address-related business logic.
 * Provides address generation and validation functionality by integrating
 * with the domain service layer.
 */
export class AddressApplicationService {
  /**
   * Constructor
   * 
   * @param addressDomainService The domain service for address operations
   */
  constructor(
    private addressDomainService: AddressDomainService
  ) {}

  /**
   * Generate address for a specific blockchain from public key
   * 
   * @param publicKey The public key to generate address from
   * @param blockchain The blockchain identifier (e.g., 'SOLANA')
   * @returns Generated blockchain address
   * @throws Error if address generation fails
   */
  public generateAddress(publicKey: string, blockchain: string): string {
    // Input validation
    if (!publicKey || typeof publicKey !== 'string' || publicKey.trim().length === 0) {
      throw new Error('Public key must be a non-empty string');
    }
    if (!blockchain || typeof blockchain !== 'string' || blockchain.trim().length === 0) {
      throw new Error('Blockchain must be a non-empty string');
    }

    // Generate address using domain service
    return this.addressDomainService.generateAddress(publicKey, blockchain);
  }

  /**
   * Validate address format for a specific blockchain
   * 
   * @param address The blockchain address to validate
   * @param blockchain The blockchain identifier (e.g., 'SOLANA')
   * @returns Boolean indicating if address is valid
   */
  public validateAddress(address: string, blockchain: string): boolean {
    // Input validation
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return false;
    }
    if (!blockchain || typeof blockchain !== 'string' || blockchain.trim().length === 0) {
      return false;
    }

    // Validate address using domain service
    return this.addressDomainService.validateAddress(address, blockchain);
  }
}
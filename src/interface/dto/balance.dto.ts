/**
 * Balance Request DTO
 * 
 * Data transfer object for balance query requests.
 * Contains address and coin information required for balance queries.
 */
export interface BalanceRequestDTO {
  /** The blockchain address to query balance for */
  address: string;
  
  /** The unique identifier of the coin (e.g., SOLANA_USDT) */
  coinKey: string;
}

/**
 * Balance Response DTO
 * 
 * Data transfer object for balance query responses.
 * Contains balance information with metadata.
 */
export interface BalanceResponseDTO {
  /** The blockchain address */
  address: string;
  
  /** The coin identifier */
  coinKey: string;
  
  /** The balance amount in smallest unit (wei, lamports, etc.) */
  balance: number;
  
  /** Formatted balance string with decimal places */
  formattedBalance: string;
  
  /** ISO timestamp of when balance was retrieved */
  lastUpdated: string;
  
  /** Block number at which balance was queried */
  blockNumber?: number;
  
  /** Whether the balance is positive */
  isPositive: boolean;
  
  /** Whether the balance is zero */
  isZero: boolean;
}

/**
 * Balance Validation DTO
 * 
 * Data transfer object for balance request validation.
 * Contains validation rules and error messages.
 */
export interface BalanceValidationDTO {
  /** Whether the address is valid */
  isAddressValid: boolean;
  
  /** Whether the coin key is valid */
  isCoinKeyValid: boolean;
  
  /** Validation error messages */
  errors: string[];
}

/**
 * Utility functions for balance DTOs
 */

/**
 * Validate balance request
 * 
 * @param request The balance request to validate
 * @returns Validation result with error messages
 */
export function validateBalanceRequest(request: BalanceRequestDTO): BalanceValidationDTO {
  const errors: string[] = [];
  
  // Validate address
  if (!request.address || request.address.trim().length === 0) {
    errors.push('Address is required');
  }
  
  // Validate coin key
  if (!request.coinKey || request.coinKey.trim().length === 0) {
    errors.push('Coin key is required');
  }
  
  return {
    isAddressValid: !!request.address && request.address.trim().length > 0,
    isCoinKeyValid: !!request.coinKey && request.coinKey.trim().length > 0,
    errors
  };
}

/**
 * Create balance response from AddressBalance entity
 * 
 * @param addressBalance The address balance entity
 * @param decimals The decimal places for formatting (default: 18)
 * @returns Formatted balance response DTO
 */
export function createBalanceResponse(
  addressBalance: any,
  decimals: number = 18
): BalanceResponseDTO {
  return {
    address: addressBalance.address,
    coinKey: addressBalance.coinKey,
    balance: addressBalance.balance,
    formattedBalance: addressBalance.getFormattedBalance(decimals),
    lastUpdated: addressBalance.lastUpdated,
    blockNumber: addressBalance.blockNumber,
    isPositive: addressBalance.isPositive(),
    isZero: addressBalance.isZero()
  };
}

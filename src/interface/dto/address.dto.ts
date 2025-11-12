/**
 * Address Generate Request DTO
 * 
 * Data transfer object for address generation requests.
 */
export interface AddressGenerateRequestDTO {
  /** The public key to generate address from */
  publicKey: string;
  
  /** The blockchain identifier (e.g., 'SOLANA') */
  blockchain: string;
}

/**
 * Address Generate Response DTO
 * 
 * Data transfer object for address generation responses.
 */
export interface AddressGenerateResponseDTO {
  /** The generated blockchain address */
  address: string;
  
  /** The blockchain identifier */
  blockchain: string;
  
  /** The public key used for generation */
  publicKey: string;
  
  /** ISO timestamp of when address was generated */
  timestamp: string;
}

/**
 * Address Validate Request DTO
 * 
 * Data transfer object for address validation requests.
 */
export interface AddressValidateRequestDTO {
  /** The blockchain address to validate */
  address: string;
  
  /** The blockchain identifier (e.g., 'SOLANA') */
  blockchain: string;
}

/**
 * Address Validate Response DTO
 * 
 * Data transfer object for address validation responses.
 */
export interface AddressValidateResponseDTO {
  /** The address that was validated */
  address: string;
  
  /** The blockchain identifier */
  blockchain: string;
  
  /** Whether the address is valid */
  isValid: boolean;
  
  /** ISO timestamp of when validation was performed */
  timestamp: string;
}

/**
 * Address Validation DTO
 * 
 * Data transfer object for address request validation.
 */
export interface AddressValidationDTO {
  /** Whether the validation passed */
  isValid: boolean;
  
  /** Validation error messages */
  errors: string[];
}

/**
 * Utility functions for address DTOs
 */

/**
 * Validate address generation request
 * 
 * @param request The address generation request to validate
 * @returns Validation result with error messages
 */
export function validateAddressGenerateRequest(request: AddressGenerateRequestDTO): AddressValidationDTO {
  const errors: string[] = [];
  
  // Validate public key
  if (!request.publicKey || request.publicKey.trim().length === 0) {
    errors.push('Public key is required');
  }
  
  // Validate blockchain
  if (!request.blockchain || request.blockchain.trim().length === 0) {
    errors.push('Blockchain is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate address validation request
 * 
 * @param request The address validation request to validate
 * @returns Validation result with error messages
 */
export function validateAddressValidateRequest(request: AddressValidateRequestDTO): AddressValidationDTO {
  const errors: string[] = [];
  
  // Validate address
  if (!request.address || request.address.trim().length === 0) {
    errors.push('Address is required');
  }
  
  // Validate blockchain
  if (!request.blockchain || request.blockchain.trim().length === 0) {
    errors.push('Blockchain is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Create address generation response
 * 
 * @param address The generated address
 * @param blockchain The blockchain identifier
 * @param publicKey The public key used for generation
 * @returns Formatted address generation response DTO
 */
export function createAddressGenerateResponse(
  address: string,
  blockchain: string,
  publicKey: string
): AddressGenerateResponseDTO {
  return {
    address,
    blockchain,
    publicKey,
    timestamp: new Date().toISOString()
  };
}

/**
 * Create address validation response
 * 
 * @param address The validated address
 * @param blockchain The blockchain identifier
 * @param isValid Whether the address is valid
 * @returns Formatted address validation response DTO
 */
export function createAddressValidateResponse(
  address: string,
  blockchain: string,
  isValid: boolean
): AddressValidateResponseDTO {
  return {
    address,
    blockchain,
    isValid,
    timestamp: new Date().toISOString()
  };
}
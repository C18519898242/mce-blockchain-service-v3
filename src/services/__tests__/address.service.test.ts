import { AddressApplicationService } from '../address.service';
import { AddressDomainService } from '@domain/address/AddressService';

describe('AddressApplicationService', () => {
  let addressApplicationService: AddressApplicationService;
  let mockAddressDomainService: jest.Mocked<AddressDomainService>;

  beforeEach(() => {
    // Create mock of AddressDomainService
    mockAddressDomainService = {
      generateAddress: jest.fn(),
      validateAddress: jest.fn(),
      generateAddressesFromPublicKey: jest.fn(),
      formatAddress: jest.fn(),
      getAddressFormat: jest.fn(),
      getSupportedBlockchains: jest.fn(),
      isSupported: jest.fn(),
    } as any;

    // Create service instance with mocked dependencies
    addressApplicationService = new AddressApplicationService(mockAddressDomainService);
  });

  describe('generateAddress', () => {
    it('should generate address successfully when valid parameters are provided', () => {
      // Arrange
      const publicKey = 'testPublicKey';
      const blockchain = 'SOLANA';
      const expectedAddress = 'solana123456789';
      
      mockAddressDomainService.generateAddress.mockReturnValue(expectedAddress);

      // Act
      const result = addressApplicationService.generateAddress(publicKey, blockchain);

      // Assert
      expect(result).toBe(expectedAddress);
      expect(mockAddressDomainService.generateAddress).toHaveBeenCalledWith(publicKey, blockchain);
    });

    it('should throw error when public key is empty', () => {
      // Arrange
      const publicKey = '';
      const blockchain = 'SOLANA';

      // Act & Assert
      expect(() => addressApplicationService.generateAddress(publicKey, blockchain))
        .toThrow('Public key must be a non-empty string');
      expect(mockAddressDomainService.generateAddress).not.toHaveBeenCalled();
    });

    it('should throw error when blockchain is empty', () => {
      // Arrange
      const publicKey = 'testPublicKey';
      const blockchain = '';

      // Act & Assert
      expect(() => addressApplicationService.generateAddress(publicKey, blockchain))
        .toThrow('Blockchain must be a non-empty string');
      expect(mockAddressDomainService.generateAddress).not.toHaveBeenCalled();
    });

    it('should throw error when public key is null', () => {
      // Arrange
      const publicKey = null as any;
      const blockchain = 'SOLANA';

      // Act & Assert
      expect(() => addressApplicationService.generateAddress(publicKey, blockchain))
        .toThrow('Public key must be a non-empty string');
      expect(mockAddressDomainService.generateAddress).not.toHaveBeenCalled();
    });

    it('should throw error when blockchain is undefined', () => {
      // Arrange
      const publicKey = 'testPublicKey';
      const blockchain = undefined as any;

      // Act & Assert
      expect(() => addressApplicationService.generateAddress(publicKey, blockchain))
        .toThrow('Blockchain must be a non-empty string');
      expect(mockAddressDomainService.generateAddress).not.toHaveBeenCalled();
    });
  });

  describe('validateAddress', () => {
    it('should validate address successfully when valid parameters are provided', () => {
      // Arrange
      const address = 'solana123456789';
      const blockchain = 'SOLANA';
      const expectedValidity = true;
      
      mockAddressDomainService.validateAddress.mockReturnValue(expectedValidity);

      // Act
      const result = addressApplicationService.validateAddress(address, blockchain);

      // Assert
      expect(result).toBe(expectedValidity);
      expect(mockAddressDomainService.validateAddress).toHaveBeenCalledWith(address, blockchain);
    });

    it('should return false when address is empty', () => {
      // Arrange
      const address = '';
      const blockchain = 'SOLANA';

      // Act
      const result = addressApplicationService.validateAddress(address, blockchain);

      // Assert
      expect(result).toBe(false);
      expect(mockAddressDomainService.validateAddress).not.toHaveBeenCalled();
    });

    it('should return false when blockchain is empty', () => {
      // Arrange
      const address = 'solana123456789';
      const blockchain = '';

      // Act
      const result = addressApplicationService.validateAddress(address, blockchain);

      // Assert
      expect(result).toBe(false);
      expect(mockAddressDomainService.validateAddress).not.toHaveBeenCalled();
    });

    it('should return false when address is null', () => {
      // Arrange
      const address = null as any;
      const blockchain = 'SOLANA';

      // Act
      const result = addressApplicationService.validateAddress(address, blockchain);

      // Assert
      expect(result).toBe(false);
      expect(mockAddressDomainService.validateAddress).not.toHaveBeenCalled();
    });

    it('should return false when blockchain is undefined', () => {
      // Arrange
      const address = 'solana123456789';
      const blockchain = undefined as any;

      // Act
      const result = addressApplicationService.validateAddress(address, blockchain);

      // Assert
      expect(result).toBe(false);
      expect(mockAddressDomainService.validateAddress).not.toHaveBeenCalled();
    });
  });
});
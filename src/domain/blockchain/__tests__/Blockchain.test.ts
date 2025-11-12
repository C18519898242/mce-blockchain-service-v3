/**
 * Blockchain Tests
 * 测试Blockchain类的功能和特性
 */

import { Blockchain } from '../Blockchain';
import { AddressFormat } from '../../address/types/AddressFormat';
import { SOLANA } from '../blockchain.constants';

describe('Blockchain', () => {
  describe('constructor', () => {
    it('should create a valid Blockchain instance', () => {
      const blockchain = new Blockchain('TEST', 'Test Blockchain', AddressFormat.SOLANA);
      
      expect(blockchain).toBeDefined();
      expect(blockchain.getId()).toBe('TEST');
      expect(blockchain.getName()).toBe('Test Blockchain');
      expect(blockchain.getAddressFormat()).toBe(AddressFormat.SOLANA);
    });
    
    it('should throw error for invalid id', () => {
      expect(() => new Blockchain('', 'Test', AddressFormat.SOLANA)).toThrow('Blockchain ID cannot be empty');
      expect(() => new Blockchain(null as any, 'Test', AddressFormat.SOLANA)).toThrow('Blockchain ID cannot be empty');
      expect(() => new Blockchain(undefined as any, 'Test', AddressFormat.SOLANA)).toThrow('Blockchain ID cannot be empty');
    });
    
    it('should throw error for invalid name', () => {
      expect(() => new Blockchain('TEST', '', AddressFormat.SOLANA)).toThrow('Blockchain name cannot be empty');
      expect(() => new Blockchain('TEST', null as any, AddressFormat.SOLANA)).toThrow('Blockchain name cannot be empty');
      expect(() => new Blockchain('TEST', undefined as any, AddressFormat.SOLANA)).toThrow('Blockchain name cannot be empty');
    });
    
    it('should throw error for invalid address format', () => {
      expect(() => new Blockchain('TEST', 'Test', null as any)).toThrow('Blockchain must have an address format');
      expect(() => new Blockchain('TEST', 'Test', undefined as any)).toThrow('Blockchain must have an address format');
    });
  });
  
  describe('getters', () => {
    const blockchain = new Blockchain('TEST', 'Test Blockchain', AddressFormat.SOLANA);
    
    it('should return correct id', () => {
      expect(blockchain.getId()).toBe('TEST');
    });
    
    it('should return correct name', () => {
      expect(blockchain.getName()).toBe('Test Blockchain');
    });
    
    it('should return correct address format', () => {
      expect(blockchain.getAddressFormat()).toBe(AddressFormat.SOLANA);
    });
  });
  
  describe('SOLANA constant', () => {
    it('should be a valid Blockchain instance', () => {
      expect(SOLANA).toBeDefined();
      expect(SOLANA instanceof Blockchain).toBe(true);
      expect(SOLANA.getId()).toBe('SOLANA');
      expect(SOLANA.getName()).toBe('Solana');
      expect(SOLANA.getAddressFormat()).toBe(AddressFormat.SOLANA);
    });
  });
  
  describe('equality comparison', () => {
    it('should consider blockchains with same id as equal', () => {
      const blockchain1 = new Blockchain('TEST', 'Test 1', AddressFormat.SOLANA);
      const blockchain2 = new Blockchain('TEST', 'Test 2', AddressFormat.SOLANA);
      
      // 使用id进行比较
      expect(blockchain1.getId()).toBe(blockchain2.getId());
    });
    
    it('should consider blockchains with different id as not equal', () => {
      const blockchain1 = new Blockchain('TEST1', 'Test', AddressFormat.SOLANA);
      const blockchain2 = new Blockchain('TEST2', 'Test', AddressFormat.SOLANA);
      
      expect(blockchain1.getId()).not.toBe(blockchain2.getId());
    });
  });
});
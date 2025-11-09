/**
 * Transaction entity for blockchain operations
 */

export enum ChainType {
  SOLANA = 'SOLANA',
  ETHEREUM = 'ETHEREUM',
  BITCOIN = 'BITCOIN',
  TRON = 'TRON'
}

export class Transaction {
  constructor(
    public readonly hash: string,
    public readonly from: string,
    public readonly to: string,
    public readonly amount: number,
    public readonly chain: ChainType,
    public readonly timestamp: string,
    public readonly status: 'PENDING' | 'CONFIRMED' | 'FAILED'
  ) {}
}

export interface TransactionParams {
  from: string;
  to: string;
  amount: number;
  chain: ChainType;
  token?: string;
  gasLimit?: number;  // ETH only
  gasPrice?: number;  // ETH only
  memo?: string;     // Solana only
}

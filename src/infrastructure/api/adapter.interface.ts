/**
 * Blockchain adapter interface for multi-chain support
 */

import { ChainType, Transaction, TransactionParams } from '../../domain/transaction/Transaction';

export type RawTransaction = any;
export type TransactionHash = string;

export interface IBlockchainAdapter {
  chain: ChainType;
  connect(): Promise<void>;
  getBalance(address: string): Promise<number>;
  buildTransaction(params: TransactionParams): Promise<RawTransaction>;
  broadcastTransaction(tx: RawTransaction): Promise<TransactionHash>;
  getTransactions(address: string, limit?: number): Promise<Transaction[]>;
}

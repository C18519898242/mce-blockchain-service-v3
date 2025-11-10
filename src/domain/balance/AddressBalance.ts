/**
 * AddressBalance Entity
 * Represents the balance of a specific coin for a blockchain address
 * Based on design specification for address-level balance management
 */

export interface AddressBalanceProperties {
  readonly address: string;
  readonly coinKey: string;       // Coin的key: ETH_USDT, SOL_USDT
  readonly balance: number;
  readonly lastUpdated: string;    // ISO timestamp
  readonly blockNumber?: number;  // 区块号，用于验证
}

export class AddressBalance {
  public readonly address: string;
  public readonly coinKey: string;
  public readonly balance: number;
  public readonly lastUpdated: string;
  public readonly blockNumber?: number;

  constructor(properties: AddressBalanceProperties) {
    this.address = properties.address;
    this.coinKey = properties.coinKey;
    this.balance = properties.balance;
    this.lastUpdated = properties.lastUpdated;
    this.blockNumber = properties.blockNumber;
    
    this.validate();
  }

  // Business methods
  public isPositive(): boolean {
    return this.balance > 0;
  }

  public isZero(): boolean {
    return this.balance === 0;
  }

  public isNegative(): boolean {
    return this.balance < 0;
  }

  public hasBlockNumber(): boolean {
    return !!this.blockNumber;
  }

  public isNewerThan(other: AddressBalance): boolean {
    const thisTime = new Date(this.lastUpdated);
    const otherTime = new Date(other.lastUpdated);
    return thisTime > otherTime;
  }

  public isAtBlock(blockNumber: number): boolean {
    return this.blockNumber === blockNumber;
  }

  public isAfterBlock(blockNumber: number): boolean {
    if (!this.blockNumber) {
      return false;
    }
    return this.blockNumber > blockNumber;
  }

  public getFormattedBalance(decimals: number = 18): string {
    const divisor = Math.pow(10, decimals);
    const formattedBalance = this.balance / divisor;
    
    if (formattedBalance === 0) {
      return '0';
    }
    
    // Handle very small numbers
    if (formattedBalance < 0.000001) {
      return formattedBalance.toExponential(6);
    }
    
    // Format with appropriate precision
    return formattedBalance.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8
    });
  }

  // Factory methods
  public static create(
    address: string,
    coinKey: string,
    balance: number,
    blockNumber?: number
  ): AddressBalance {
    return new AddressBalance({
      address,
      coinKey,
      balance,
      lastUpdated: new Date().toISOString(),
      blockNumber
    });
  }

  public static withTimestamp(
    address: string,
    coinKey: string,
    balance: number,
    lastUpdated: string,
    blockNumber?: number
  ): AddressBalance {
    return new AddressBalance({
      address,
      coinKey,
      balance,
      lastUpdated,
      blockNumber
    });
  }

  // Update methods
  public updateBalance(newBalance: number, newBlockNumber?: number): AddressBalance {
    return new AddressBalance({
      address: this.address,
      coinKey: this.coinKey,
      balance: newBalance,
      lastUpdated: new Date().toISOString(),
      blockNumber: newBlockNumber
    });
  }

  public addBalance(amount: number, newBlockNumber?: number): AddressBalance {
    return this.updateBalance(this.balance + amount, newBlockNumber);
  }

  public subtractBalance(amount: number, newBlockNumber?: number): AddressBalance {
    return this.updateBalance(this.balance - amount, newBlockNumber);
  }

  // Serialization
  public toJSON(): AddressBalanceJSON {
    return {
      address: this.address,
      coinKey: this.coinKey,
      balance: this.balance,
      lastUpdated: this.lastUpdated,
      blockNumber: this.blockNumber
    };
  }

  public static fromJSON(json: AddressBalanceJSON): AddressBalance {
    return new AddressBalance({
      address: json.address,
      coinKey: json.coinKey,
      balance: json.balance,
      lastUpdated: json.lastUpdated,
      blockNumber: json.blockNumber
    });
  }

  // Utility methods
  public getUniqueId(): string {
    return `${this.coinKey}_${this.address}`;
  }

  public getAge(): number {
    const now = new Date();
    const lastUpdate = new Date(this.lastUpdated);
    return now.getTime() - lastUpdate.getTime();
  }

  public isStale(maxAgeMs: number = 300000): boolean { // 5 minutes default
    return this.getAge() > maxAgeMs;
  }

  // Private validation
  private validate(): void {
    if (!this.address || this.address.trim().length === 0) {
      throw new Error('Address is required');
    }

    if (!this.coinKey || this.coinKey.trim().length === 0) {
      throw new Error('Coin key is required');
    }

    if (typeof this.balance !== 'number' || isNaN(this.balance)) {
      throw new Error('Balance must be a valid number');
    }

    if (!this.lastUpdated || this.lastUpdated.trim().length === 0) {
      throw new Error('Last updated timestamp is required');
    }

    // Validate timestamp format
    const timestamp = new Date(this.lastUpdated);
    if (isNaN(timestamp.getTime())) {
      throw new Error('Last updated must be a valid ISO timestamp');
    }

    if (this.blockNumber !== undefined && (typeof this.blockNumber !== 'number' || this.blockNumber < 0)) {
      throw new Error('Block number must be a positive number');
    }
  }
}

// JSON serialization interface
export interface AddressBalanceJSON {
  address: string;
  coinKey: string;
  balance: number;
  lastUpdated: string;
  blockNumber?: number;
}

// Utility functions
export function isValidAddress(address: string): boolean {
  return typeof address === 'string' && address.trim().length > 0;
}

export function isValidCoinKey(coinKey: string): boolean {
  return typeof coinKey === 'string' && coinKey.trim().length > 0;
}

export function isValidBalance(balance: number): boolean {
  return typeof balance === 'number' && !isNaN(balance) && isFinite(balance);
}

export function isValidTimestamp(timestamp: string): boolean {
  if (typeof timestamp !== 'string' || timestamp.trim().length === 0) {
    return false;
  }
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
}

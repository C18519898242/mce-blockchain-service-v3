/**
 * Coin Entity
 * Represents a cryptocurrency coin with blockchain-specific properties
 * Based on design specification: blockchain + symbol combination as unique identifier
 * Extended to match Java version with additional fields
 * Only Solana blockchain is supported
 */

export interface CoinProperties {
  readonly key: string;             // 唯一标识：SOLANA_SOL, SOLANA_USDT
  readonly testKey?: string;        // 测试网络密钥
  readonly name: string;            // 币种名称：Solana, Tether USD
  readonly network: string;         // 网络标识：mainnet, testnet
  readonly blockchain: string;       // 仅支持 SOLANA
  readonly blockchainAlias?: string; // 区块链别名
  readonly type: string;            // 类型：native, token
  readonly decimal: number;          // 精度：6, 8, 18 (保持与Java版本一致)
  readonly fullName: string;        // 全名：Solana on SOLANA
  readonly addressRefUrl?: string;   // 地址查询URL模板
  readonly txRefUrl?: string;        // 交易查询URL模板
  readonly tokenIdentifier?: string; // 代币标识符
  readonly chainId?: string;         // 链ID
  readonly confirmCount: number;     // 确认数
  readonly contractAddress?: string; // 代币合约地址 (保持现有字段)
}

export class Coin {
  public readonly key: string;
  public readonly testKey?: string;
  public readonly name: string;
  public readonly network: string;
  public readonly blockchain: string;
  public readonly blockchainAlias?: string;
  public readonly type: string;
  public readonly decimal: number;
  public readonly fullName: string;
  public readonly addressRefUrl?: string;
  public readonly txRefUrl?: string;
  public readonly tokenIdentifier?: string;
  public readonly chainId?: string;
  public readonly confirmCount: number;
  public readonly contractAddress?: string;

  constructor(properties: CoinProperties) {
    this.key = properties.key;
    this.testKey = properties.testKey;
    this.name = properties.name;
    this.network = properties.network;
    this.blockchain = properties.blockchain;
    this.blockchainAlias = properties.blockchainAlias;
    this.type = properties.type;
    this.decimal = properties.decimal;
    this.fullName = properties.fullName;
    this.addressRefUrl = properties.addressRefUrl;
    this.txRefUrl = properties.txRefUrl;
    this.tokenIdentifier = properties.tokenIdentifier;
    this.chainId = properties.chainId;
    this.confirmCount = properties.confirmCount;
    this.contractAddress = properties.contractAddress;
    
    this.validate();
  }

  // Business methods
  public isNative(): boolean {
    return this.type === 'native';
  }

  public isToken(): boolean {
    return this.type === 'token';
  }

  public isTestnet(): boolean {
    return this.network === 'testnet';
  }

  public isMainnet(): boolean {
    return this.network === 'mainnet';
  }

  public getFullName(): string {
    return this.fullName;
  }

  public getAddressRefUrl(address?: string): string | undefined {
    if (!this.addressRefUrl) return undefined;
    return address ? this.addressRefUrl.replace('{address}', address) : this.addressRefUrl;
  }

  public getTxRefUrl(txHash?: string): string | undefined {
    if (!this.txRefUrl) return undefined;
    return txHash ? this.txRefUrl.replace('{txHash}', txHash) : this.txRefUrl;
  }

  // Factory methods
  public static createNativeCoin(
    symbol: string, 
    name: string,
    network: string = 'mainnet',
    decimal: number = 9,
    confirmCount: number = 32
  ): Coin {
    const key = `SOLANA_${symbol}`;
    const fullName = `${name} on SOLANA`;
    
    return new Coin({
      key,
      name,
      network,
      blockchain: 'SOLANA',
      type: 'native',
      decimal,
      fullName,
      confirmCount
    });
  }

  public static createToken(
    symbol: string, 
    name: string,
    decimal: number,
    contractAddress: string,
    network: string = 'mainnet',
    confirmCount: number = 32,
    options?: {
      blockchainAlias?: string;
      addressRefUrl?: string;
      txRefUrl?: string;
      tokenIdentifier?: string;
      chainId?: string;
      testKey?: string;
    }
  ): Coin {
    const key = `SOLANA_${symbol}`;
    const fullName = `${name} on SOLANA`;
    
    return new Coin({
      key,
      name,
      network,
      blockchain: 'SOLANA',
      type: 'token',
      decimal,
      fullName,
      contractAddress,
      confirmCount,
      ...options
    });
  }

  // Serialization
  public toJSON(): CoinJSON {
    return {
      key: this.key,
      testKey: this.testKey,
      name: this.name,
      network: this.network,
      blockchain: this.blockchain,
      blockchainAlias: this.blockchainAlias,
      type: this.type,
      decimal: this.decimal,
      fullName: this.fullName,
      addressRefUrl: this.addressRefUrl,
      txRefUrl: this.txRefUrl,
      tokenIdentifier: this.tokenIdentifier,
      chainId: this.chainId,
      confirmCount: this.confirmCount,
      contractAddress: this.contractAddress
    };
  }

  public static fromJSON(json: CoinJSON): Coin {
    return new Coin({
      key: json.key,
      testKey: json.testKey,
      name: json.name,
      network: json.network,
      blockchain: json.blockchain,
      blockchainAlias: json.blockchainAlias,
      type: json.type,
      decimal: json.decimal,
      fullName: json.fullName,
      addressRefUrl: json.addressRefUrl,
      txRefUrl: json.txRefUrl,
      tokenIdentifier: json.tokenIdentifier,
      chainId: json.chainId,
      confirmCount: json.confirmCount,
      contractAddress: json.contractAddress
    });
  }

  // Private validation
  private validate(): void {
    if (!this.key || this.key.trim().length === 0) {
      throw new Error('Coin key is required');
    }

    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Coin name is required');
    }

    if (!this.network || this.network.trim().length === 0) {
      throw new Error('Network is required');
    }

    if (!this.blockchain || this.blockchain.trim().length === 0) {
      throw new Error('Blockchain is required');
    }

    // Only Solana is supported
    if (this.blockchain !== 'SOLANA') {
      throw new Error('Only Solana blockchain is supported');
    }

    if (!this.type || this.type.trim().length === 0) {
      throw new Error('Coin type is required');
    }

    if (!['native', 'token'].includes(this.type)) {
      throw new Error('Coin type must be either "native" or "token"');
    }

    if (!this.fullName || this.fullName.trim().length === 0) {
      throw new Error('Full name is required');
    }

    if (this.decimal < 0 || this.decimal > 18) {
      throw new Error('Decimal must be between 0 and 18');
    }

    if (this.confirmCount < 0) {
      throw new Error('Confirm count must be non-negative');
    }

    if (!['mainnet', 'testnet'].includes(this.network)) {
      throw new Error('Network must be either "mainnet" or "testnet"');
    }

    // For tokens, contract address is required
    if (this.type === 'token' && !this.contractAddress) {
      throw new Error('Contract address is required for tokens');
    }

    // For native coins, contract address should not be present
    if (this.type === 'native' && this.contractAddress) {
      throw new Error('Contract address should not be present for native coins');
    }

    // Validate key format: SOLANA_symbol
    const expectedKey = `SOLANA_${this.key.split('_')[1]}`;
    if (!this.key.startsWith('SOLANA_')) {
      throw new Error(`Coin key must start with 'SOLANA_'. Got: ${this.key}`);
    }
  }
}

// JSON serialization interface
export interface CoinJSON {
  key: string;
  testKey?: string;
  name: string;
  network: string;
  blockchain: string;
  blockchainAlias?: string;
  type: string;
  decimal: number;
  fullName: string;
  addressRefUrl?: string;
  txRefUrl?: string;
  tokenIdentifier?: string;
  chainId?: string;
  confirmCount: number;
  contractAddress?: string;
}

// Supported blockchain constants - Only Solana is supported
export const BLOCKCHAINS = {
  SOLANA: 'SOLANA'
} as const;

// Network constants
export const NETWORKS = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet'
} as const;

// Coin type constants
export const COIN_TYPES = {
  NATIVE: 'native',
  TOKEN: 'token'
} as const;

// Type guard for blockchain validation
export function isValidBlockchain(value: string): value is keyof typeof BLOCKCHAINS {
  return Object.values(BLOCKCHAINS).includes(value as typeof BLOCKCHAINS[keyof typeof BLOCKCHAINS]);
}

// Type guard for network validation
export function isValidNetwork(value: string): value is keyof typeof NETWORKS {
  return Object.values(NETWORKS).includes(value as typeof NETWORKS[keyof typeof NETWORKS]);
}

// Type guard for coin type validation
export function isValidCoinType(value: string): value is keyof typeof COIN_TYPES {
  return Object.values(COIN_TYPES).includes(value as typeof COIN_TYPES[keyof typeof COIN_TYPES]);
}

/**
 * Blockchain Configuration
 * 
 * Configuration for blockchain network connections and settings.
 */

export interface BlockchainConfig {
  /**
   * Solana blockchain configuration
   */
  solana: {
    /**
     * RPC URL for Solana blockchain
     */
    rpcUrl: string;
    
    /**
     * Timeout for Solana RPC requests in milliseconds
     */
    timeout: number;
  };
}

/**
 * Blockchain configuration instance
 * 
 * Reads configuration from environment variables with sensible defaults.
 */
// Check if Solana RPC URL is configured properly
let solanaRpcUrl = process.env.SOLANA_RPC_URL || process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com';

// Show severe warning if no custom RPC URL is configured
if (!process.env.SOLANA_RPC_URL && !process.env.SOLANA_RPC) {
  console.error('⚠️ SEVERE WARNING: Solana RPC URL is not configured!');
  console.error('⚠️ Using default Mainnet URL: https://api.mainnet-beta.solana.com');
  console.error('⚠️ This may cause rate limits, performance issues, or unexpected behavior');
  console.error('⚠️ Please configure SOLANA_RPC_URL or SOLANA_RPC environment variable with a dedicated RPC endpoint');
}

export const blockchainConfig: BlockchainConfig = {
  solana: {
    rpcUrl: solanaRpcUrl,
    timeout: parseInt(process.env.SOLANA_RPC_TIMEOUT || '30000', 10)
  }
};
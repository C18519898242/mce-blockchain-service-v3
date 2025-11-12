// Load environment variables for testing
const dotenv = require('dotenv');
const path = require('path');

// Try to load .env file
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Log environment variable loading status for debugging
console.log('Environment variables loaded for testing');
console.log('SOLANA_RPC_URL:', process.env.SOLANA_RPC_URL);
console.log('SOLANA_RPC:', process.env.SOLANA_RPC);
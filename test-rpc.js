// 简单的Solana RPC连接测试脚本
const { Connection, PublicKey } = require('@solana/web3.js');

// 使用用户提供的RPC URL
const RPC_URL = 'https://hidden-dawn-sponge.solana-devnet.quiknode.pro/94e016bc2df47042f21fb9b61212984ec81f1f3e';

async function testRpcConnection() {
  console.log(`Testing connection to Solana RPC: ${RPC_URL}`);
  
  try {
    // 创建连接
    const connection = new Connection(RPC_URL, 'confirmed');
    
    // 测试连接是否建立
    console.log('Connection created successfully');
    
    // 尝试获取最近的区块高度
    console.log('Fetching latest block number...');
    const blockNumber = await connection.getBlockHeight();
    console.log(`✅ Success! Latest block number: ${blockNumber}`);
    
    // 测试一个简单的账户余额查询
    const testAddress = '11111111111111111111111111111111'; // Solana系统程序地址
    console.log(`Fetching balance for address: ${testAddress}`);
    const balance = await connection.getBalance(new PublicKey(testAddress));
    console.log(`✅ Success! Balance: ${balance / 1e9} SOL`);
    
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error(error);
    return false;
  }
}

// 运行测试
(async () => {
  const success = await testRpcConnection();
  process.exit(success ? 0 : 1);
})();
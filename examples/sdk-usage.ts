/**
 * MNEE Connect SDK Usage Examples
 * Comprehensive examples for developers
 */

import { MneeClient, toWei, fromWei, formatMnee } from '@mnee-connect/sdk';
import { privateKeyToAccount } from 'viem/accounts';

// ============================================
// EXAMPLE 1: Basic Setup and Balance Check
// ============================================

async function example1_BasicSetup() {
  console.log('=== Example 1: Basic Setup ===\n');

  // Initialize the client
  const client = new MneeClient({
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
    account: privateKeyToAccount('0xYOUR_PRIVATE_KEY' as `0x${string}`),
  });

  // Check balance
  const balance = await client.getBalance('0xYourAddress' as `0x${string}`);
  console.log(`Balance: ${balance} MNEE`);
  console.log(`Formatted: ${formatMnee(toWei(balance))}\n`);
}

// ============================================
// EXAMPLE 2: Simple Payment
// ============================================

async function example2_SimplePayment() {
  console.log('=== Example 2: Simple Payment ===\n');

  const client = new MneeClient({
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
    account: privateKeyToAccount('0xYOUR_PRIVATE_KEY' as `0x${string}`),
  });

  // Send 100.50 MNEE
  const receipt = await client.sendPayment({
    to: '0xRecipientAddress' as `0x${string}`,
    amount: '100.50',
  });

  console.log('Payment sent!');
  console.log(`Transaction: ${receipt.hash}`);
  console.log(`Amount: ${fromWei(receipt.amount)} MNEE`);
  console.log(`Status: ${receipt.status}\n`);
}

// ============================================
// EXAMPLE 3: AI Agent Authorization
// ============================================

async function example3_AuthorizeAgent() {
  console.log('=== Example 3: AI Agent Authorization ===\n');

  const client = new MneeClient({
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
    account: privateKeyToAccount('0xYOUR_PRIVATE_KEY' as `0x${string}`),
  });

  // Authorize an AI agent with 1000 MNEE limit for 1 hour
  const sessionKey = await client.authorizeAgent({
    spendLimit: '1000',
    duration: 3600,
    label: 'AI Shopping Assistant',
  });

  console.log('Session Key Created:');
  console.log(`Address: ${sessionKey.address}`);
  console.log(`Spend Limit: ${fromWei(sessionKey.spendLimit)} MNEE`);
  console.log(`Expires At: ${new Date(sessionKey.expiresAt * 1000).toLocaleString()}`);
  
  // ⚠️ IMPORTANT: Store the private key securely!
  // In production, encrypt before storing
  console.log(`\n⚠️ Save this private key: ${sessionKey.privateKey}`);
  console.log('You will need it for agent payments!\n');

  return sessionKey;
}

// ============================================
// EXAMPLE 4: Agent Makes Payment
// ============================================

async function example4_AgentPayment(sessionKey: any) {
  console.log('=== Example 4: Agent Payment ===\n');

  const client = new MneeClient({
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
    account: privateKeyToAccount('0xYOUR_PRIVATE_KEY' as `0x${string}`),
  });

  // Agent makes autonomous payment
  const receipt = await client.sendPayment({
    to: '0xMerchantAddress' as `0x${string}`,
    amount: '50.25',
    sessionKey: sessionKey,
  });

  console.log('Agent payment successful!');
  console.log(`Transaction: ${receipt.hash}`);
  console.log(`Remaining Limit: ${fromWei(sessionKey.remainingLimit)} MNEE\n`);
}

// ============================================
// EXAMPLE 5: Check Allowance
// ============================================

async function example5_CheckAllowance() {
  console.log('=== Example 5: Check Allowance ===\n');

  const client = new MneeClient({
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
  });

  const allowance = await client.getAllowance(
    '0xOwnerAddress' as `0x${string}`,
    '0xSpenderAddress' as `0x${string}`
  );

  console.log(`Allowance: ${allowance} MNEE\n`);
}

// ============================================
// EXAMPLE 6: Approve Spender
// ============================================

async function example6_ApproveSpender() {
  console.log('=== Example 6: Approve Spender ===\n');

  const client = new MneeClient({
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
    account: privateKeyToAccount('0xYOUR_PRIVATE_KEY' as `0x${string}`),
  });

  // Approve a contract to spend 500 MNEE
  const hash = await client.approve(
    '0xContractAddress' as `0x${string}`,
    '500'
  );

  console.log('Approval transaction sent!');
  console.log(`Transaction: ${hash}\n`);
}

// ============================================
// EXAMPLE 7: Revoke Session Key
// ============================================

async function example7_RevokeSessionKey() {
  console.log('=== Example 7: Revoke Session Key ===\n');

  const client = new MneeClient({
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
    account: privateKeyToAccount('0xYOUR_PRIVATE_KEY' as `0x${string}`),
  });

  // Revoke a previously created session key
  const hash = await client.revokeSessionKey('AI Shopping Assistant');

  console.log('Session key revoked!');
  console.log(`Transaction: ${hash}\n`);
}

// ============================================
// EXAMPLE 8: Estimate Gas
// ============================================

async function example8_EstimateGas() {
  console.log('=== Example 8: Estimate Gas ===\n');

  const client = new MneeClient({
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
    account: privateKeyToAccount('0xYOUR_PRIVATE_KEY' as `0x${string}`),
  });

  const gasEstimate = await client.estimateGas(
    '0xRecipientAddress' as `0x${string}`,
    '100'
  );

  console.log(`Estimated Gas: ${gasEstimate.toString()} wei\n`);
}

// ============================================
// EXAMPLE 9: Utility Functions
// ============================================

function example9_UtilityFunctions() {
  console.log('=== Example 9: Utility Functions ===\n');

  // Convert MNEE to wei
  const weiAmount = toWei('100.50');
  console.log(`100.50 MNEE = ${weiAmount} wei`);

  // Convert wei to MNEE
  const mneeAmount = fromWei(100500000n);
  console.log(`100500000 wei = ${mneeAmount} MNEE`);

  // Format with symbol
  const formatted = formatMnee(100500000n);
  console.log(`Formatted: ${formatted}\n`);
}

// ============================================
// EXAMPLE 10: Real-World Use Case
// ============================================

async function example10_RealWorldUseCase() {
  console.log('=== Example 10: AI SaaS Subscription ===\n');

  const client = new MneeClient({
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
    account: privateKeyToAccount('0xYOUR_PRIVATE_KEY' as `0x${string}`),
  });

  // Scenario: User subscribes to AI service for $50/month
  // 1. Create session key with monthly limit
  const sessionKey = await client.authorizeAgent({
    spendLimit: '50', // $50 worth of MNEE
    duration: 30 * 24 * 3600, // 30 days
    label: 'AI SaaS Monthly Subscription',
  });

  console.log('✅ Subscription activated!');
  console.log(`Monthly Limit: ${fromWei(sessionKey.spendLimit)} MNEE`);

  // 2. Store session key in your database (encrypted!)
  await storeSessionKeyInDatabase({
    userId: 'user_123',
    sessionKeyAddress: sessionKey.address,
    privateKey: sessionKey.privateKey, // ENCRYPT THIS!
    spendLimit: sessionKey.spendLimit.toString(),
    expiresAt: sessionKey.expiresAt,
  });

  // 3. AI service charges user automatically
  const charge = await client.sendPayment({
    to: '0xSaaSCompanyAddress' as `0x${string}`,
    amount: '50',
    sessionKey: sessionKey,
  });

  console.log('\n💰 Monthly charge processed:');
  console.log(`Transaction: ${charge.hash}`);
  console.log('✅ User charged automatically without manual approval!\n');
}

// Mock database function
async function storeSessionKeyInDatabase(data: any) {
  console.log('\n📦 Storing session key in database...');
  // In real app: await prisma.sessionKey.create({ data: ... })
}

// ============================================
// RUN ALL EXAMPLES
// ============================================

async function runAllExamples() {
  try {
    // await example1_BasicSetup();
    // await example2_SimplePayment();
    
    // const sessionKey = await example3_AuthorizeAgent();
    // await example4_AgentPayment(sessionKey);
    
    // await example5_CheckAllowance();
    // await example6_ApproveSpender();
    // await example7_RevokeSessionKey();
    // await example8_EstimateGas();
    
    example9_UtilityFunctions();
    
    // await example10_RealWorldUseCase();

    console.log('✅ All examples completed!\n');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Uncomment to run:
// runAllExamples();

export {
  example1_BasicSetup,
  example2_SimplePayment,
  example3_AuthorizeAgent,
  example4_AgentPayment,
  example5_CheckAllowance,
  example6_ApproveSpender,
  example7_RevokeSessionKey,
  example8_EstimateGas,
  example9_UtilityFunctions,
  example10_RealWorldUseCase,
};

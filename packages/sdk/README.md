# @mnee-connect/sdk

TypeScript SDK for MNEE Stablecoin payments. Enables AI agents and SaaS applications to automate payments with session keys and account abstraction.

## Features

- 🤖 **AI Agent Authorization** - Create session keys for autonomous agent spending
- 💸 **Simple Payments** - Abstract ERC-20 complexity with easy-to-use methods
- 🔐 **Session Key Management** - Ephemeral signers with spend limits
- ⚡ **High Performance** - Built on Viem for optimal performance
- 📝 **Full TypeScript** - Complete type safety and IntelliSense

## Installation

```bash
npm install @mnee-connect/sdk viem
```

## Quick Start

```typescript
import { MneeClient } from '@mnee-connect/sdk';
import { privateKeyToAccount } from 'viem/accounts';

// Initialize client
const client = new MneeClient({
  rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
  account: privateKeyToAccount('0xYOUR_PRIVATE_KEY')
});

// Check balance
const balance = await client.getBalance('0xYourAddress');
console.log(`Balance: ${balance} MNEE`);

// Send payment
const receipt = await client.sendPayment({
  to: '0xRecipient',
  amount: '100.50'
});
```

## AI Agent Authorization

```typescript
// Authorize an AI agent with spending limit
const sessionKey = await client.authorizeAgent({
  spendLimit: '1000',  // 1000 MNEE max
  duration: 3600,      // 1 hour
  label: 'AI Assistant'
});

// Agent can now make payments autonomously
const agentPayment = await client.sendPayment({
  to: '0xMerchant',
  amount: '50.25',
  sessionKey: sessionKey  // Use session key instead of main account
});
```

## API Reference

### MneeClient

#### Constructor

```typescript
new MneeClient(config: MneeClientConfig)
```

#### Methods

- `getBalance(address)` - Get MNEE balance
- `sendPayment(options)` - Send MNEE payment
- `authorizeAgent(options)` - Create session key for agent
- `approve(spender, amount)` - Approve ERC-20 allowance
- `getAllowance(owner, spender)` - Check allowance
- `revokeSessionKey(keyId)` - Revoke agent authorization
- `estimateGas(to, amount)` - Estimate gas cost

## License

MIT

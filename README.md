# MNEE Connect

A Stripe-like SDK and dashboard for the MNEE Stablecoin ecosystem, enabling AI Agents and SaaS apps to automate payments with session keys and account abstraction.

![MNEE Connect](https://img.shields.io/badge/Built%20with-Next.js%2014-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Blockchain](https://img.shields.io/badge/Blockchain-Ethereum-purple)

## 🚀 Features

- **🤖 AI Agent Authorization** - Create session keys for autonomous agent spending with configurable limits
- **⚡ Gasless Payments** - Enable zero-gas transactions with ERC-4337 account abstraction
- **📊 Developer Dashboard** - Stripe-inspired UI to track payments and manage API keys
- **🔑 Session Key Management** - Ephemeral signers with spend limits for secure transactions
- **🔔 Webhooks** - Real-time payment notifications for backend integration
- **📚 TypeScript SDK** - Fully typed SDK with comprehensive JSDoc comments

## 📦 Project Structure

```
mnee-connect/
├── packages/
│   └── sdk/                    # @mnee-connect/sdk - Core TypeScript SDK
│       ├── src/
│       │   ├── MneeClient.ts   # Main client class
│       │   ├── constants.ts    # Token config and ABIs
│       │   ├── utils.ts        # Helper functions
│       │   └── index.ts        # Public exports
│       └── package.json
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/                # API Routes
│   │   │   ├── webhooks/       # Payment webhooks
│   │   │   ├── session-keys/   # Session key management
│   │   │   └── api-keys/       # API key management
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── dashboard/          # Dashboard components
│   │   └── PaymentWidget.tsx   # Payment widget
│   ├── hooks/                  # Custom React hooks
│   │   └── useMnee.ts          # MNEE token hook
│   └── lib/                    # Utilities
│       ├── prisma.ts           # Prisma client
│       └── web3-provider.tsx   # Web3 provider
├── prisma/
│   └── schema.prisma           # Database schema
└── package.json
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TailwindCSS, ConnectKit
- **Web3**: Viem, Wagmi, Permissionless.js (ERC-4337)
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Blockchain**: Ethereum L1/L2, ERC-20 (MNEE Token)

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Ethereum wallet with MNEE tokens
- Alchemy API key (recommended)

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd "c:\Ravi\Personal\Hackathon\2026\MNEE Connect1"
npm install
```

### 2. Configure Environment

Update `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mnee_connect"

# MNEE Token
NEXT_PUBLIC_MNEE_TOKEN_ADDRESS="0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf"
NEXT_PUBLIC_MNEE_DECIMALS="6"

# Blockchain
NEXT_PUBLIC_CHAIN_ID="1"
NEXT_PUBLIC_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"

# Alchemy (for account abstraction)
ALCHEMY_API_KEY="your_alchemy_key"
```

### 3. Setup Database

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📚 SDK Usage

### Installation

```bash
npm install @mnee-connect/sdk viem
```

### Basic Example

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

console.log(`Payment sent: ${receipt.hash}`);
```

### AI Agent Authorization

```typescript
// Authorize an AI agent with spending limit
const sessionKey = await client.authorizeAgent({
  spendLimit: '1000',  // 1000 MNEE max
  duration: 3600,      // 1 hour
  label: 'AI Assistant'
});

// Store session key securely
console.log('Session Key:', sessionKey.privateKey);
console.log('Address:', sessionKey.address);

// Agent can now make payments autonomously
const agentPayment = await client.sendPayment({
  to: '0xMerchant',
  amount: '50.25',
  sessionKey: sessionKey
});
```

### React Hook Usage

```typescript
import { useMnee } from '@/hooks/useMnee';

function PaymentComponent() {
  const { balance, sendPayment, isConnected } = useMnee();

  const handlePay = async () => {
    const hash = await sendPayment('0xRecipient', '100.50');
    console.log('Payment sent:', hash);
  };

  return (
    <div>
      <p>Balance: {balance} MNEE</p>
      <button onClick={handlePay} disabled={!isConnected}>
        Send Payment
      </button>
    </div>
  );
}
```

## 🔌 API Reference

### Webhooks

**POST /api/webhooks/payment**

Log a successful payment:

```json
{
  "transactionHash": "0x...",
  "fromAddress": "0x...",
  "toAddress": "0x...",
  "amount": "100500000",
  "payerType": "AI_AGENT"
}
```

**GET /api/webhooks/payment?address=0x...**

Retrieve transactions for an address.

### Session Keys

**POST /api/session-keys**

Create a new session key:

```json
{
  "label": "AI Assistant",
  "privateKey": "0x...",
  "address": "0x...",
  "ownerAddress": "0x...",
  "spendLimit": "1000000000",
  "expiresAt": 1735689600
}
```

**GET /api/session-keys?owner=0x...&activeOnly=true**

List session keys for an owner.

**DELETE /api/session-keys?id=...**

Revoke a session key.

### API Keys

**POST /api/api-keys**

Create developer API key:

```json
{
  "name": "Production API",
  "userId": "0x...",
  "permissions": ["read", "write"]
}
```

## 🎨 Dashboard Features

### 1. **Overview Dashboard**
- Current MNEE balance
- Total transaction volume
- AI agent vs human payment breakdown
- Recent transactions table

### 2. **Transaction Management**
- Filter by sent/received
- View transaction details on Etherscan
- Status tracking (Pending/Confirmed/Failed)
- Payer type identification (Human/AI Agent)

### 3. **API Key Management**
- Create new API keys
- View usage statistics
- Revoke compromised keys
- Copy keys securely

### 4. **Session Key Management**
- Create session keys for agents
- Set spend limits and expiration
- Monitor remaining balance
- Revoke active sessions

## 🔐 Security Best Practices

1. **Never expose private keys** - Use environment variables
2. **Encrypt session keys** - Before storing in database
3. **Validate API keys** - Use middleware for authentication
4. **Set reasonable limits** - For session key spending
5. **Monitor transactions** - Set up alerts for unusual activity

## 🧪 Testing

```bash
# Run type checking
npm run build

# Generate Prisma client
npm run prisma:generate

# View database in Prisma Studio
npm run prisma:studio
```

## 📖 MNEE Token Details

- **Address**: `0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf`
- **Decimals**: 6 (USDC-style)
- **Standard**: ERC-20
- **Network**: Ethereum Mainnet

## 🤝 Contributing

This is a hackathon project. Contributions welcome!

## 📄 License

MIT

## 🔗 Resources

- [MNEE Token Contract](https://etherscan.io/token/0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf)
- [Viem Documentation](https://viem.sh)
- [Wagmi Documentation](https://wagmi.sh)
- [ERC-4337 Spec](https://eips.ethereum.org/EIPS/eip-4337)

## 📞 Support

Built for MNEE Connect Hackathon 2026

---

**Made with ❤️ using Next.js, Viem, and the MNEE Stablecoin**

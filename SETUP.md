# MNEE Connect - Project Setup Guide

## Initial Setup Complete! ✅

All core components have been implemented:

### ✅ Completed Components

1. **SDK Package** (`packages/sdk/`)
   - MneeClient class with session key management
   - TypeScript utilities and helpers
   - ERC-20 ABI and constants
   - Comprehensive JSDoc comments

2. **React Hooks** (`src/hooks/`)
   - useMnee - Wagmi wrapper for MNEE operations
   - Balance tracking, payments, approvals

3. **Backend API** (`src/app/api/`)
   - Payment webhooks
   - Session key management
   - API key management
   - Transaction logging

4. **Database** (`prisma/`)
   - Complete schema for transactions, keys, analytics
   - Prisma ORM configuration

5. **Dashboard UI** (`src/app/dashboard/`)
   - Stripe-inspired interface
   - Transaction table with filtering
   - Stats cards with metrics
   - API key manager

6. **Payment Widget** (`src/components/`)
   - Reusable payment component
   - Gasless payment option (placeholder)
   - Success/error states

## Next Steps to Run the Project

### 1. Install PostgreSQL

If you don't have PostgreSQL installed:

**Windows:**
```powershell
# Download from: https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**Create Database:**
```powershell
# Connect to PostgreSQL
psql -U postgres

# In psql:
CREATE DATABASE mnee_connect;
\q
```

### 2. Update Environment Variables

Edit `.env.local` with your actual values:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mnee_connect?schema=public"
NEXT_PUBLIC_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"
```

**Get Alchemy API Key:**
1. Go to [alchemy.com](https://www.alchemy.com/)
2. Create free account
3. Create new app for Ethereum Mainnet
4. Copy API key

### 3. Initialize Database

```powershell
cd 'c:\Ravi\Personal\Hackathon\2026\MNEE Connect1'

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 4. Start Development Server

```powershell
npm run dev
```

Visit: http://localhost:3000

## Project Structure Overview

```
mnee-connect/
├── packages/sdk/          # Core SDK library
│   ├── src/
│   │   ├── MneeClient.ts  # Main client (SESSION KEYS!)
│   │   ├── constants.ts   # Token config
│   │   └── utils.ts       # Helpers
│
├── src/
│   ├── app/
│   │   ├── api/           # Backend routes
│   │   ├── dashboard/     # Dashboard UI
│   │   └── page.tsx       # Home + demo widget
│   │
│   ├── components/
│   │   ├── dashboard/     # Dashboard components
│   │   └── PaymentWidget.tsx
│   │
│   ├── hooks/
│   │   └── useMnee.ts     # React hook for MNEE
│   │
│   └── lib/
│       ├── prisma.ts      # DB client
│       └── web3-provider.tsx
│
└── prisma/
    └── schema.prisma      # Database schema
```

## Key Features Implemented

### 1. MneeClient SDK (`packages/sdk/src/MneeClient.ts`)

The star of the show! Features:

- **authorizeAgent()** - Creates ephemeral session keys
- **sendPayment()** - Send MNEE with or without session keys
- **getBalance()** - Check MNEE balance
- **approve()** - ERC-20 approvals
- **revokeSessionKey()** - Revoke agent access

### 2. Session Key Flow

```typescript
// 1. Authorize agent
const sessionKey = await client.authorizeAgent({
  spendLimit: '1000',
  duration: 3600
});

// 2. Store key securely (encrypted in production!)
// sessionKey.privateKey, sessionKey.address

// 3. Agent makes payment
await client.sendPayment({
  to: '0xRecipient',
  amount: '50',
  sessionKey: sessionKey
});
```

### 3. Dashboard Features

- **Stats Cards** - Balance, volume, transaction count
- **Transaction Table** - Filter by sent/received, view on Etherscan
- **API Key Manager** - Create, revoke, copy keys
- **Payment Widget** - Demo payment flow

## Testing the Project

### 1. Connect Wallet
- Click "Connect Wallet" in dashboard
- Use MetaMask or other Web3 wallet

### 2. Check Balance
- Dashboard shows MNEE balance
- Must have MNEE tokens to test payments

### 3. Create API Key
- Go to dashboard → API Keys
- Click "Create API Key"
- Copy and save the key (shown only once!)

### 4. Test Payment Widget
- Home page has demo widget
- Enter amount and pay
- Transaction logged to database

## Troubleshooting

### Issue: Database connection error
**Solution:** Verify DATABASE_URL in `.env.local` and PostgreSQL is running

### Issue: RPC connection failed
**Solution:** Check NEXT_PUBLIC_RPC_URL - needs valid Alchemy/Infura key

### Issue: Module not found errors
**Solution:** Run `npm install` again

### Issue: Wallet not connecting
**Solution:** Ensure MetaMask is installed and on Ethereum mainnet

## Future Enhancements

### Phase 2 (Post-Hackathon):

1. **Gasless Payments** - Full ERC-4337 integration with Alchemy paymaster
2. **Stream Payments** - Integrate Superfluid for continuous payments
3. **Session Key Encryption** - Encrypt private keys in database
4. **Webhook Signatures** - HMAC verification for webhook security
5. **Multi-chain Support** - L2 networks (Optimism, Arbitrum)
6. **Agent Dashboard** - Dedicated UI for AI agent monitoring
7. **Payment Links** - Generate shareable payment links
8. **Recurring Payments** - Subscription-style recurring charges

## Production Checklist

Before deploying to production:

- [ ] Encrypt session keys in database
- [ ] Add API key authentication middleware
- [ ] Implement rate limiting
- [ ] Add webhook signature verification
- [ ] Set up monitoring and alerts
- [ ] Use environment-specific configs
- [ ] Enable CORS properly
- [ ] Add comprehensive error handling
- [ ] Set up CI/CD pipeline
- [ ] Configure domain and SSL

## Architecture Highlights

### Clean Architecture ✅
- **SDK Layer** - Pure business logic (packages/sdk)
- **API Layer** - Backend routes (src/app/api)
- **UI Layer** - React components (src/components)
- **Data Layer** - Prisma ORM (prisma/)

### Performance ✅
- **Viem** - 5x faster than ethers.js
- **React Query** - Automatic caching
- **Parallel reads** - Optimized data fetching

### Security ✅
- **Session keys** - Limited scope and duration
- **API keys** - Hashed storage
- **Type safety** - Full TypeScript coverage

## Resources

- **Viem Docs**: https://viem.sh
- **Wagmi Docs**: https://wagmi.sh
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js 14**: https://nextjs.org/docs
- **ERC-4337**: https://eips.ethereum.org/EIPS/eip-4337

---

**Ready to build! 🚀**

The foundation is complete. Start the dev server and begin testing!

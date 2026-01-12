# Migration Guide: Upgrading to Agent Commerce

## Overview

This guide walks you through upgrading your existing MNEE Connect installation to include the new Agent Commerce features.

---

## Prerequisites

- Existing MNEE Connect installation (Next.js 14)
- Node.js 18+ and npm
- PostgreSQL database
- Ethereum wallet with MNEE tokens
- Alchemy API key (for RPC)
- Pimlico API key (for Paymaster, optional)

---

## Step 1: Update Dependencies

```bash
# Already installed in your project:
# - permissionless@0.2.11
# - @prisma/client
# - viem@2.44.1
# - wagmi@2.19.5

# No additional dependencies needed!
```

---

## Step 2: Database Migration

### Generate Prisma Client

```bash
npm run prisma:generate
```

### Run Migration

```bash
npm run prisma:migrate dev --name add-agent-commerce-features
```

This will add the following models:
- `EscrowTransaction`
- `PaymasterTransaction`
- `YieldDeposit`
- `UserSettings`

And enums:
- `EscrowStatus`
- `PaymasterStatus`

### Verify Migration

```bash
# Check database tables
npm run prisma:studio
```

You should see the new tables in Prisma Studio.

---

## Step 3: Environment Variables

Add to your `.env.local`:

```env
# Existing variables (keep these)
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_ALCHEMY_API_KEY="your_alchemy_key"
NEXT_PUBLIC_MNEE_TOKEN_ADDRESS="0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf"

# New variables for Agent Commerce
NEXT_PUBLIC_PIMLICO_API_KEY="your_pimlico_key"
NEXT_PUBLIC_BUNDLER_URL="https://api.pimlico.io/v1/1/rpc?apikey=your_key"
NEXT_PUBLIC_PAYMASTER_URL="https://api.pimlico.io/v2/1/rpc?apikey=your_key"

# Escrow contract (deploy first, then add address)
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS="0x..." 

# Aave V3 (already on mainnet, no deployment needed)
NEXT_PUBLIC_AAVE_POOL_ADDRESS="0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"
```

---

## Step 4: Deploy Escrow Contract

### Option A: Using Hardhat

```bash
# Install Hardhat (if not already)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Create Hardhat config
npx hardhat init
```

Create `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    }
  }
};
```

Create deployment script `scripts/deploy-escrow.js`:

```javascript
const hre = require("hardhat");

async function main() {
  const MNEE_TOKEN = "0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf";
  const ATTESTATION_PROVIDER = "0xYourBackendAddress"; // Your backend signer

  const MneeEscrow = await hre.ethers.getContractFactory("MneeEscrow");
  const escrow = await MneeEscrow.deploy(MNEE_TOKEN, ATTESTATION_PROVIDER);

  await escrow.waitForDeployment();

  console.log(`MneeEscrow deployed to: ${await escrow.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Deploy:

```bash
npx hardhat run scripts/deploy-escrow.js --network mainnet
```

### Option B: Using Remix IDE

1. Go to https://remix.ethereum.org
2. Create new file: `MneeEscrow.sol`
3. Copy contract code from `contracts/MneeEscrow.sol`
4. Compile with Solidity 0.8.20
5. Deploy using Injected Provider (MetaMask)
6. Constructor args:
   - `_mneeToken`: `0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf`
   - `_attestationProvider`: Your backend wallet address

---

## Step 5: Update SDK Exports

The SDK now includes new services. Update your imports:

```typescript
// Old imports (still work)
import { MneeClient } from '@mnee-connect/sdk';

// New imports (for advanced features)
import { AccountAbstractionService } from '@mnee-connect/sdk/services/AccountAbstractionService';
import { AaveYieldService } from '@mnee-connect/sdk/services/AaveYieldService';
```

---

## Step 6: Test New Features

### Test 1: Gasless Payments

```typescript
import { MneeClient } from '@mnee-connect/sdk';

const client = new MneeClient({
  rpcUrl: process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL!,
  account: privateKeyToAccount('0x...')
});

// Create session key first
const sessionKey = await client.authorizeAgent({
  spendLimit: '100',
  duration: 3600
});

// Test gasless payment
const result = await client.sendGaslessPayment({
  to: '0xRecipient',
  amount: '10',
  sessionKey: sessionKey,
  maxGasCostInMnee: '2'
});

console.log('Gasless payment result:', result);
```

### Test 2: Escrow

```typescript
// Create escrow
const escrow = await client.createEscrow({
  providerAddress: '0xProvider',
  amount: '50',
  taskDescription: 'Test task',
  deadlineHours: 24,
  autoRefund: true
});

console.log('Escrow created:', escrow.taskId);

// Later: Release or refund
// const release = await client.releaseEscrow({
//   taskId: escrow.taskId,
//   attestationUID: '0x...'
// });
```

### Test 3: Yield

```typescript
// Enable yield mode
const settings = await client.enableYield(true, {
  minIdleBalance: '100',
  idleDurationHours: 24,
  autoYieldEnabled: true
});

console.log('Yield mode enabled:', settings);

// Get yield stats
const stats = await client.getYieldStats();
console.log('Yield stats:', stats);
```

---

## Step 7: Update Frontend

The dashboard now includes:
- **Accrued Yield card** in StatsCards
- **Yield Mode Toggle** component

These are automatically included if you're using the updated `dashboard/page.tsx`.

To verify:

```bash
npm run dev
```

Navigate to http://localhost:3001/dashboard

You should see:
- 5 stat cards (including "Accrued Yield")
- "Yield Farming Mode" toggle section
- Existing API Keys and Transactions sections

---

## Step 8: Verify API Endpoints

Test all new endpoints:

### Paymaster
```bash
curl -X POST http://localhost:3001/api/paymaster/sponsor \
  -H "Content-Type: application/json" \
  -d '{
    "agentAddress": "0x...",
    "recipientAddress": "0x...",
    "amount": "10",
    "maxGasCostInMnee": "2"
  }'
```

### Escrow
```bash
curl -X POST http://localhost:3001/api/escrow/create \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "0x123",
    "agentAddress": "0x...",
    "providerAddress": "0x...",
    "amount": "50000000",
    "amountFormatted": "50",
    "taskDescription": "Test",
    "deadline": "2026-01-15T10:00:00Z",
    "autoRefund": true
  }'
```

### Yield
```bash
curl -X POST http://localhost:3001/api/yield/toggle \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0x...",
    "yieldModeEnabled": true,
    "minIdleBalance": "100",
    "idleDurationHours": 24
  }'
```

---

## Step 9: Production Deployment

### Vercel Deployment

```bash
# Push to GitHub
git add .
git commit -m "Add Agent Commerce features"
git push

# Vercel will auto-deploy
# Add environment variables in Vercel dashboard
```

### Environment Variables (Vercel)

Go to Vercel Dashboard → Settings → Environment Variables

Add:
- `DATABASE_URL`
- `NEXT_PUBLIC_ALCHEMY_API_KEY`
- `NEXT_PUBLIC_PIMLICO_API_KEY`
- `NEXT_PUBLIC_BUNDLER_URL`
- `NEXT_PUBLIC_PAYMASTER_URL`
- `NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS`

### Database Migration (Production)

```bash
# Connect to production database
DATABASE_URL="postgresql://prod..." npx prisma migrate deploy
```

---

## Step 10: Monitor & Logs

### Check Webhook Events

```sql
SELECT * FROM "WebhookEvent" 
WHERE "eventType" IN (
  'paymaster.sponsor.requested',
  'escrow.created',
  'yield.deposit.created'
)
ORDER BY "createdAt" DESC 
LIMIT 10;
```

### Check Transactions

```sql
-- Paymaster transactions
SELECT * FROM "PaymasterTransaction" ORDER BY "createdAt" DESC LIMIT 5;

-- Escrow transactions
SELECT * FROM "EscrowTransaction" ORDER BY "createdAt" DESC LIMIT 5;

-- Yield deposits
SELECT * FROM "YieldDeposit" WHERE "isActive" = true;
```

---

## Rollback Plan

If you need to rollback:

### 1. Revert Database Migration

```bash
npm run prisma:migrate resolve --rolled-back add-agent-commerce-features
```

### 2. Restore Previous Code

```bash
git revert HEAD
git push
```

### 3. Remove Environment Variables

Remove new variables from `.env.local` and Vercel.

---

## Common Issues

### Issue 1: Prisma Client Not Updated

**Error:** `Property 'escrowTransaction' does not exist on type 'PrismaClient'`

**Fix:**
```bash
npm run prisma:generate
```

### Issue 2: Contract Not Deployed

**Error:** `Cannot read property 'lockFunds' of undefined`

**Fix:** Deploy MneeEscrow.sol first, then add address to `.env.local`

### Issue 3: Pimlico API Errors

**Error:** `Paymaster request failed: 401 Unauthorized`

**Fix:** Check your Pimlico API key is valid and has sufficient credits

### Issue 4: Database Connection

**Error:** `Can't reach database server at...`

**Fix:** 
1. Check `DATABASE_URL` is correct
2. Ensure PostgreSQL is running
3. Verify network connectivity

---

## Testing Checklist

- [ ] Database migration completed successfully
- [ ] Prisma Client generated with new models
- [ ] Escrow contract deployed to mainnet
- [ ] Environment variables configured
- [ ] SDK methods work (gasless payment, escrow, yield)
- [ ] API endpoints respond correctly
- [ ] Dashboard shows new components
- [ ] Stats card displays accrued yield
- [ ] Yield toggle works
- [ ] No TypeScript errors
- [ ] Application builds successfully
- [ ] Production deployment successful

---

## Support

If you encounter issues:

1. Check the logs: `npm run dev` output
2. Review `AGENT_COMMERCE_FEATURES.md` for detailed docs
3. Inspect database: `npm run prisma:studio`
4. Test API endpoints individually
5. Verify environment variables are set

---

## Next Steps

After successful migration:

1. **Create Sample Data:** Use SDK to create test escrows, payments, yields
2. **Monitor Performance:** Track gas costs, yield APY, transaction success rates
3. **Optimize Settings:** Adjust idle thresholds, minimum balances based on usage
4. **Documentation:** Share API docs with your AI agent developers
5. **Marketing:** Announce new features to your users!

---

## Congratulations! 🎉

Your MNEE Connect platform is now a production-grade Agent Commerce infrastructure with:

✅ Gasless MNEE payments (ERC-4337)  
✅ Proof-of-Task escrow protection  
✅ Automated yield farming (Aave V3)  

**Estimated migration time:** 30-60 minutes

**Questions?** Check `AGENT_COMMERCE_FEATURES.md` for detailed documentation.

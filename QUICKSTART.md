# ⚡ MNEE Connect - Quick Start Guide

Get up and running in 5 minutes!

## 🎯 What You're Building

A Stripe-like payment platform for MNEE Stablecoin with:
- 🤖 AI Agent session keys
- 💳 Payment widgets
- 📊 Developer dashboard
- 🔑 API key management

## ✅ Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and running
- [ ] MetaMask or Web3 wallet
- [ ] Alchemy account (free tier)
- [ ] MNEE tokens (for testing)

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (1 min)

```powershell
cd 'c:\Ravi\Personal\Hackathon\2026\MNEE Connect1'
npm install
```

### Step 2: Setup PostgreSQL (2 min)

**Create Database:**
```powershell
# Open PostgreSQL command line
psql -U postgres

# Create database
CREATE DATABASE mnee_connect;

# Exit
\q
```

### Step 3: Configure Environment (1 min)

**Get Alchemy API Key:**
1. Go to https://www.alchemy.com/
2. Sign up (free)
3. Create new app → Ethereum Mainnet
4. Copy API key

**Update `.env.local`:**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/mnee_connect"
NEXT_PUBLIC_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"
```

### Step 4: Initialize Database (1 min)

```powershell
npm run prisma:generate
npm run prisma:migrate
```

### Step 5: Start Development Server (30 sec)

```powershell
npm run dev
```

**Open:** http://localhost:3000

---

## 🎮 Testing the Platform

### Test 1: Connect Wallet
1. Click "Connect Wallet" button
2. Approve MetaMask connection
3. Switch to Ethereum mainnet

### Test 2: View Dashboard
1. Navigate to http://localhost:3000/dashboard
2. See your MNEE balance
3. View transaction table (empty initially)

### Test 3: Create API Key
1. Scroll to "API Keys" section
2. Click "Create API Key"
3. Enter name: "Test Key"
4. Copy the generated key (shown only once!)

### Test 4: Try Payment Widget
1. Go to home page: http://localhost:3000
2. Scroll to "Try it Now" section
3. Enter amount (e.g., "10")
4. Click "Pay X MNEE"
5. Approve transaction in MetaMask
6. See success message!

### Test 5: Check Transaction
1. Return to dashboard
2. Transaction appears in table
3. Click hash to view on Etherscan

---

## 🧪 Testing the SDK

Create a test file `test-sdk.ts`:

```typescript
import { MneeClient } from './packages/sdk/src';
import { privateKeyToAccount } from 'viem/accounts';

async function test() {
  const client = new MneeClient({
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
    account: privateKeyToAccount('0xYOUR_PRIVATE_KEY' as `0x${string}`)
  });

  // Check balance
  const balance = await client.getBalance('0xYourAddress' as `0x${string}`);
  console.log('Balance:', balance, 'MNEE');

  // Authorize AI agent
  const sessionKey = await client.authorizeAgent({
    spendLimit: '100',
    duration: 3600,
    label: 'Test Agent'
  });
  
  console.log('Session key created:', sessionKey.address);
}

test();
```

Run: `npx tsx test-sdk.ts`

---

## 📊 Project Structure at a Glance

```
mnee-connect/
├── packages/sdk/          # ⭐ Core SDK
│   └── src/
│       └── MneeClient.ts  # Main class with session keys
│
├── src/
│   ├── app/
│   │   ├── api/           # Backend routes
│   │   ├── dashboard/     # Dashboard UI
│   │   └── page.tsx       # Landing page
│   │
│   ├── components/
│   │   ├── PaymentWidget.tsx      # Payment component
│   │   └── dashboard/             # Dashboard components
│   │
│   ├── hooks/
│   │   └── useMnee.ts     # React hook for MNEE
│   │
│   └── lib/
│       └── prisma.ts      # Database client
│
└── prisma/
    └── schema.prisma      # Database schema
```

---

## 🐛 Common Issues & Fixes

### Issue: "Database connection error"
**Fix:** Check PostgreSQL is running
```powershell
# Windows: Check service
Get-Service postgresql*
```

### Issue: "RPC connection failed"
**Fix:** Verify Alchemy API key in `.env.local`

### Issue: "Wallet not connecting"
**Fix:** 
1. Ensure MetaMask is installed
2. Switch to Ethereum mainnet
3. Refresh page

### Issue: "Transaction failed"
**Fix:** 
1. Check you have MNEE tokens
2. Check you have ETH for gas
3. Try increasing gas limit

### Issue: "Module not found"
**Fix:** 
```powershell
rm -r node_modules
npm install
```

---

## 📚 Next Steps

### Learn More:
1. **Read SDK docs:** `packages/sdk/README.md`
2. **Study examples:** `examples/sdk-usage.ts`
3. **Deep dive:** `PROJECT_SUMMARY.md`

### Customize:
1. **Theme:** Edit `src/app/globals.css`
2. **Logo:** Update `DashboardLayout.tsx`
3. **Add pages:** Create files in `src/app/`

### Deploy:
1. **Vercel:** `vercel deploy`
2. **Database:** Use Supabase or Neon
3. **Env vars:** Set in hosting platform

---

## 🎯 Key Features to Explore

### 1. Session Keys (AI Agent Authorization)
```typescript
const sessionKey = await client.authorizeAgent({
  spendLimit: '1000',
  duration: 3600
});
```

### 2. Payment Widget
```tsx
<PaymentWidget
  recipientAddress="0x..."
  amount="50"
  enableGasless={true}
/>
```

### 3. Transaction Tracking
- Dashboard shows all payments
- Filter by sent/received
- AI agent identification

### 4. API Key Management
- Secure key generation
- Usage tracking
- One-time display

---

## 💡 Pro Tips

**Development:**
- Use `npm run prisma:studio` to view database
- Check console for detailed error messages
- Use browser DevTools Network tab

**Security:**
- Never commit `.env.local`
- Never expose private keys
- Always encrypt session keys in production

**Performance:**
- Transactions take 12-15 seconds on Ethereum
- Use Optimism/Base for faster/cheaper
- Consider L2 for production

---

## 🆘 Getting Help

**Resources:**
- `README.md` - Main documentation
- `SETUP.md` - Detailed setup guide
- `PROJECT_SUMMARY.md` - Complete overview
- `examples/sdk-usage.ts` - Code examples

**External:**
- Viem Docs: https://viem.sh
- Wagmi Docs: https://wagmi.sh
- Prisma Docs: https://www.prisma.io/docs

---

## ✅ Completion Checklist

Mark as complete:

- [ ] Dependencies installed
- [ ] PostgreSQL running
- [ ] Database created and migrated
- [ ] Environment variables configured
- [ ] Dev server started
- [ ] Wallet connected
- [ ] First API key created
- [ ] First transaction made
- [ ] Transaction appears in dashboard

**Congratulations! You're ready to build! 🎉**

---

## 🚀 What's Next?

**For This Hackathon:**
1. Test all features
2. Create demo video
3. Write use case documentation
4. Polish UI/UX

**For Production:**
1. Add ERC-4337 gasless payments
2. Encrypt session keys
3. Add webhook signatures
4. Deploy to Vercel
5. Set up monitoring

---

**Happy Building! 💪**

Built with ❤️ for MNEE Stablecoin  
January 11, 2026

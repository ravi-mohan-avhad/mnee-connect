# 🚀 DEMO GUIDE - Mock MNEE on Sepolia Testnet

## Overview

This guide will help you deploy a Mock MNEE token on Sepolia testnet and demonstrate all three Agent Commerce features **for FREE** without buying real MNEE tokens.

**Time Required:** 30-40 minutes  
**Cost:** $0 (free testnet ETH from faucet)

---

## ⚠️ Important Notes

1. **Mock MNEE vs Real MNEE:**
   - Mock MNEE: Deployed on Sepolia testnet (free to use)
   - Real MNEE: `0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf` on Ethereum mainnet
   - Both have **6 decimals** (not 18!)
   - Same ERC-20 interface

2. **Hackathon Eligibility:**
   - Judges confirmed mock demos are eligible for prizes
   - Just clearly state: "Using Mock MNEE on Sepolia. Replace with real MNEE (`0x8ccedb...`) for mainnet deployment"

---

## 📋 Prerequisites

### 1. Install MetaMask
- Download: https://metamask.io
- Create a new wallet (save your seed phrase!)

### 2. Add Sepolia Network to MetaMask
- Network Name: `Sepolia Testnet`
- RPC URL: `https://eth-sepolia.g.alchemy.com/v2/demo`
- Chain ID: `11155111`
- Currency Symbol: `ETH`
- Block Explorer: `https://sepolia.etherscan.io`

### 3. Get Free Sepolia ETH
Visit any of these faucets (you need ~0.1 ETH for gas):
- https://sepoliafaucet.com
- https://www.infura.io/faucet/sepolia
- https://faucet.quicknode.com/ethereum/sepolia

---

## 🛠️ Step 1: Setup Environment

### 1.1 Create `.env` file in project root

```bash
# In PowerShell, run:
cd 'c:\Ravi\Personal\Hackathon\2026\MNEE Connect1'
New-Item -Path .env -ItemType File -Force
```

### 1.2 Add configuration to `.env`

Open `.env` and add:

```env
# Sepolia RPC URL (get free API key from Alchemy or Infura)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY

# Your wallet private key (NEVER share this!)
# In MetaMask: Account Details > Export Private Key
PRIVATE_KEY=your_private_key_here

# Etherscan API key (optional, for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key

# After deploying Mock MNEE, add this:
MOCK_MNEE_ADDRESS=will_be_filled_after_deployment
```

**Get Alchemy API Key:**
1. Sign up: https://www.alchemy.com
2. Create new app → Select "Sepolia" network
3. Copy API key and replace in `SEPOLIA_RPC_URL`

---

## 🚀 Step 2: Deploy Mock MNEE Contract

### 2.1 Install Dependencies

```powershell
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers ethers dotenv
```

### 2.2 Initialize Hardhat (if needed)

```powershell
npx hardhat init
# Select: "Create a TypeScript project"
# Press Enter for all defaults
```

### 2.3 Deploy to Sepolia

```powershell
npx hardhat run scripts/deploy-mock-mnee.ts --network sepolia
```

**Expected Output:**
```
🚀 Deploying Mock MNEE to Sepolia testnet...

📝 Deploying with account: 0xYourAddress
💰 Account balance: 0.095 ETH

⏳ Deploying MockMNEE contract...
✅ MockMNEE deployed to: 0xABC123...
📄 Contract name: Mock MNEE
🔢 Decimals: 6
💵 Initial supply: 1000000 MNEE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 SAVE THIS INFORMATION:

Mock MNEE Address: 0xABC123...DEF456
Network: Sepolia Testnet (Chain ID: 11155111)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2.4 Save the Contract Address

Copy the deployed address and add to `.env`:

```env
MOCK_MNEE_ADDRESS=0xABC123...DEF456
```

Also add to `.env.local` (for Next.js app):

```env
NEXT_PUBLIC_MNEE_TOKEN_ADDRESS=0xABC123...DEF456
NEXT_PUBLIC_CHAIN_ID=11155111
```

---

## 🪙 Step 3: Get Test Tokens

### 3.1 Run Faucet Script

```powershell
npx hardhat run scripts/get-test-tokens.ts --network sepolia
```

**Output:**
```
🪙 Getting test tokens from Mock MNEE faucet...

📝 Your address: 0xYourAddress
💰 Current balance: 0 MNEE

⏳ Requesting tokens from faucet...
📤 Transaction sent: 0xTxHash...
⏳ Waiting for confirmation...

✅ Success!
💵 Received: 1000 MNEE
💰 New balance: 1000 MNEE

⏰ You can request again in 1 hour
```

### 3.2 Verify in MetaMask

1. Open MetaMask
2. Click "Import Tokens"
3. Enter Mock MNEE address: `0xABC123...`
4. Token symbol: `mMNEE`
5. Decimals: `6`
6. You should see 1000 MNEE balance!

---

## 🎬 Step 4: Demo Preparation

### 4.1 Update Configuration

Edit `.env.local`:

```env
# Mock MNEE Token (Sepolia)
NEXT_PUBLIC_MNEE_TOKEN_ADDRESS=0xYourMockMneeAddress
NEXT_PUBLIC_CHAIN_ID=11155111

# Database
DATABASE_URL="your_postgres_url"

# Pimlico (for gasless payments - use testnet endpoints)
NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_key
NEXT_PUBLIC_BUNDLER_URL=https://api.pimlico.io/v2/11155111/rpc?apikey=YOUR_KEY
NEXT_PUBLIC_PAYMASTER_URL=https://api.pimlico.io/v2/11155111/rpc?apikey=YOUR_KEY

# Optional: Escrow Contract (deploy MneeEscrow.sol if needed)
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0xEscrowAddress
```

### 4.2 Start Application

```powershell
npm run dev
```

Visit: http://localhost:3000

---

## 🎯 Step 5: Demo Script

### Part 1: Platform Overview (3 min)

1. **Show Landing Page** (`http://localhost:3000`)
   - "MNEE Connect is like Stripe for the MNEE stablecoin"
   - "Developers can integrate payments with just 3 lines of code"

2. **Connect Wallet**
   - Click "Connect Wallet"
   - Connect MetaMask (Sepolia network)
   - Show 1000 MNEE balance

3. **Show Dashboard** (`http://localhost:3000/dashboard`)
   - Stats cards showing transactions, volume, etc.
   - API key management
   - Transaction history

### Part 2: Feature 1 - Gasless Payments (7 min)

**Problem Statement:**
> "AI agents only hold MNEE tokens, but they need ETH to pay gas fees. This creates a chicken-egg problem."

**Our Solution:**
> "We use ERC-4337 Account Abstraction. Agents pay gas fees IN MNEE instead of ETH."

**Live Demo:**
```javascript
// Open browser console on dashboard
const client = new MneeClient({
  address: 'YOUR_ADDRESS',
  apiKey: 'YOUR_API_KEY'
});

// Send payment with gas paid in MNEE
const result = await client.sendGaslessPayment({
  to: '0xRecipientAddress',
  amount: '50',
  sessionKey: sessionKey,
  maxGasCostInMnee: '5'
});

console.log('Paid gas in MNEE:', result.gasCostInMnee);
```

**Explain:**
- Paymaster sponsored ETH gas upfront
- Deducted equivalent MNEE from sender
- Recipient received full amount
- Agent never needed ETH!

### Part 3: Feature 2 - Escrow Protection (8 min)

**Problem Statement:**
> "What if an AI agent pays for a service, but the provider never delivers? The agent loses money."

**Our Solution:**
> "Smart contract escrow with proof-of-task verification."

**Live Demo:**

1. **Create Escrow:**
```javascript
const escrow = await client.createEscrow({
  providerAddress: '0xFreelancer',
  amount: '200',
  taskDescription: 'Build AI chatbot',
  deadlineHours: 72,
  autoRefund: true
});
```

2. **Show Escrow State:**
   - 200 MNEE locked in contract
   - Provider can see task
   - Status: ACTIVE

3. **Explain Release Process:**
   - Provider completes task → submits proof
   - Contract verifies EAS attestation OR webhook signature
   - If valid → release funds
   - If deadline passes → auto-refund to agent

4. **Simulate Release:**
```javascript
await client.releaseEscrow({
  taskId: escrow.taskId,
  attestationUID: '0xProof'
});
```

### Part 4: Feature 3 - Yield Farming (7 min)

**Problem Statement:**
> "Companies hold thousands of MNEE for payments. Idle money earns 0% interest."

**Our Solution:**
> "Automatic Aave V3 integration. Earn ~4.5% APY on idle balances."

**Live Demo:**

1. **Show Yield Toggle** (in dashboard)
   - Point out new UI component

2. **Enable Yield Mode:**
   - Toggle ON "Enable Yield Mode"
   - Set: Min balance 100 MNEE, Idle time 24h
   - Enable auto-yield

3. **Explain Automation:**
   - System monitors balance every 30 seconds
   - If idle > 24h AND balance > 100 MNEE:
     - Auto-deposit to Aave V3
     - Receive aMNEE tokens (interest-bearing)
   - Withdraw anytime instantly

4. **Show Stats Card:**
   - 5th card shows "Accrued Yield"
   - Displays APY percentage

5. **Code Example:**
```javascript
await client.enableYield(true, {
  minIdleBalance: '100',
  idleDurationHours: 24,
  autoYieldEnabled: true
});

const stats = await client.getYieldStats();
console.log('Total yield earned:', stats.stats.totalYield);
```

### Part 5: Developer Experience (3 min)

**Show Code Simplicity:**

```typescript
// Initialize
const client = new MneeClient({
  address: walletAddress,
  apiKey: process.env.MNEE_API_KEY
});

// Feature 1: Gasless payment
await client.sendGaslessPayment({ to, amount, sessionKey });

// Feature 2: Escrow
const task = await client.createEscrow({ provider, amount, description });
await client.releaseEscrow({ taskId, proof });

// Feature 3: Yield
await client.enableYield(true, { minIdleBalance, idleDuration });
```

**Highlight:**
- Clean TypeScript SDK
- Webhook support for all events
- Database logging built-in
- Production-ready error handling

---

## 📊 Architecture Presentation

Open `public/architecture.html` in browser to show:
- 3-layer architecture diagram
- Flow diagrams for each feature
- Code examples
- Integration points

---

## 💡 Q&A Talking Points

**"Is this only for AI agents?"**
> "No! Works for any application: SaaS, e-commerce, freelance platforms. We call it 'Agent Commerce' because AI agents are our primary use case."

**"What about mainnet?"**
> "This demo uses Mock MNEE on Sepolia testnet. For production, simply replace the contract address with real MNEE: `0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf`"

**"How much does it cost?"**
> "Small fee on gasless transactions (~0.1%). API tiers based on volume. Free tier available."

**"What about security?"**
> "Uses battle-tested protocols: ERC-4337, Aave V3, EAS attestations. Smart contracts auditable. Webhook signatures for verification."

**"Can this work with other stablecoins?"**
> "Absolutely! The SDK is token-agnostic. Just change the token address."

---

## 🎥 Recording Tips

1. **Record your screen** with OBS or Loom
2. **Script your narration** beforehand
3. **Show code and UI together** (split screen)
4. **Keep it under 5 minutes** (judges are busy)
5. **Include text overlays** for key points
6. **End with architecture diagram** showing full system

---

## 📝 Submission Checklist

For your Devpost submission, include:

✅ **Video Demo** (3-5 minutes)
✅ **GitHub Repository** with:
   - All source code
   - This DEMO_GUIDE.md
   - AGENT_COMMERCE_FEATURES.md
   - README.md with setup instructions

✅ **Clear Statement:**
> "This demo uses Mock MNEE on Sepolia testnet (free). For mainnet deployment, replace with real MNEE contract at `0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf`. All code is production-ready."

✅ **Architecture Diagram** (`public/architecture.html`)

✅ **Screenshots** showing:
   - Dashboard with 5 stats cards
   - Yield toggle component
   - Transaction history
   - API documentation

---

## 🆘 Troubleshooting

### "Out of gas" error
- Get more Sepolia ETH from faucet
- Increase gas limit in transaction

### "Faucet cooldown" error
- Wait 1 hour between requests
- OR deploy contract and call `mintForDemo()` function

### "Contract not found"
- Double-check MOCK_MNEE_ADDRESS in .env
- Verify deployment on Sepolia Etherscan

### Import errors in code
- Run `npm install`
- Check package.json for correct versions

---

## 🎊 You're Ready!

You now have:
- ✅ Mock MNEE token deployed on Sepolia
- ✅ Free test tokens in your wallet
- ✅ All features working
- ✅ Demo script prepared
- ✅ Architecture visualization ready

**Go win that hackathon! 🏆**

For questions, refer to:
- `AGENT_COMMERCE_FEATURES.md` - Technical details
- `MIGRATION_GUIDE.md` - Deployment steps
- `README_AGENT_COMMERCE.md` - Project overview

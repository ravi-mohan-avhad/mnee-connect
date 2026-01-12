# MNEE Connect - Agent Commerce Features

## 🚀 Overview

MNEE Connect has been upgraded into a **production-grade Agent Commerce infrastructure** with three critical features:

1. **Gasless MNEE** (ERC-4337 Paymaster) - AI agents pay gas fees in MNEE instead of ETH
2. **Proof-of-Task Agent Escrow** - Protect agents from service provider scams
3. **Idle Yield** (Aave V3 Integration) - Earn interest on idle MNEE balances

---

## 🌟 Feature 1: Gasless MNEE (ERC-4337 Paymaster)

### What It Does
Allows AI agents to pay transaction gas fees in MNEE tokens instead of ETH, making blockchain interactions more seamless for agents that only hold MNEE.

### How It Works
1. **Smart Account Creation**: Each agent gets an ERC-4337 Smart Account
2. **Paymaster Sponsorship**: Paymaster pays ETH gas fees upfront
3. **MNEE Deduction**: Equivalent MNEE amount is deducted from agent's balance
4. **UserOperation**: Transaction bundled into a UserOperation for efficient processing

### Architecture

```
┌─────────────────────────────────────────────────┐
│  AI Agent (Session Key)                         │
│  Balance: 1000 MNEE, 0 ETH                      │
└────────────────┬────────────────────────────────┘
                 │ Wants to send 50 MNEE
                 ▼
┌─────────────────────────────────────────────────┐
│  AccountAbstractionService                      │
│  • Creates Smart Account                        │
│  • Estimates gas cost: ~$2 = 2 MNEE             │
│  • Checks balance: 1000 > (50 + 2) ✓            │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Paymaster (Pimlico/Biconomy)                   │
│  • Sponsors gas: Pays ~$2 in ETH                │
│  • Returns UserOp Hash                          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Blockchain Execution                           │
│  • Transfer 50 MNEE to recipient                │
│  • Deduct 2 MNEE for gas from agent             │
│  • Agent new balance: 948 MNEE                  │
└─────────────────────────────────────────────────┘
```

### Code Implementation

#### Service Layer: `AccountAbstractionService.ts`

```typescript
import { createSmartAccountClient } from 'permissionless';
import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';

const service = new AccountAbstractionService(
  'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
  'https://api.pimlico.io/v2/1/rpc?apikey=YOUR_KEY', // Paymaster
  'https://api.pimlico.io/v1/1/rpc?apikey=YOUR_KEY'  // Bundler
);

const result = await service.sendGaslessPayment({
  sessionKeyPrivateKey: '0x...',
  ownerAddress: '0xAgent',
  recipientAddress: '0xRecipient',
  amount: '50.25',
  maxGasCostInMnee: '10'
});
```

#### SDK Method

```typescript
const client = new MneeClient({ 
  rpcUrl: '...', 
  account 
});

const result = await client.sendGaslessPayment({
  to: '0xRecipient',
  amount: '50.25',
  sessionKey: sessionKey,
  maxGasCostInMnee: '5'
});

console.log(result.userOpHash); // "0x..."
console.log(result.gasCostInMnee); // "2.15"
```

#### API Endpoint

```bash
POST /api/paymaster/sponsor
Content-Type: application/json

{
  "agentAddress": "0x...",
  "recipientAddress": "0x...",
  "amount": "50.25",
  "sessionKeyId": "cuid...",
  "maxGasCostInMnee": "5"
}
```

### Database Tracking

```prisma
model PaymasterTransaction {
  id                String   @id @default(cuid())
  userOpHash        String   @unique
  transactionHash   String?  @unique
  
  agentAddress      String
  recipientAddress  String
  amount            String
  amountFormatted   String
  
  gasCostInWei      String
  gasCostInMnee     String   // Key metric!
  
  sessionKeyId      String?
  paymasterAddress  String
  status            PaymasterStatus
  
  createdAt         DateTime @default(now())
  confirmedAt       DateTime?
}
```

### Configuration

**Environment Variables:**
```env
NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_key
NEXT_PUBLIC_BUNDLER_URL=https://api.pimlico.io/v1/1/rpc
NEXT_PUBLIC_PAYMASTER_URL=https://api.pimlico.io/v2/1/rpc
```

---

## 🔒 Feature 2: Proof-of-Task Agent Escrow

### What It Does
A smart contract escrow system that locks MNEE funds until a task is verified complete, preventing agents from being scammed by service providers.

### How It Works
1. **Agent locks funds**: Creates escrow with task description and deadline
2. **Provider performs task**: Completes work and provides proof
3. **Attestation verification**: Escrow verifies EAS attestation or webhook signature
4. **Conditional release**: Funds released only with valid proof
5. **Auto-refund**: If deadline passes without completion, agent gets refund

### Smart Contract

**File:** `contracts/MneeEscrow.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MneeEscrow {
    enum TaskStatus { Active, Completed, Refunded, Disputed }
    
    struct EscrowTask {
        address agent;
        address serviceProvider;
        uint256 amount;
        uint256 deadline;
        TaskStatus status;
        bytes32 taskId;
        string taskDescription;
        bool autoRefund;
    }
    
    mapping(bytes32 => EscrowTask) public tasks;
    
    function lockFunds(
        address _serviceProvider,
        uint256 _amount,
        uint256 _deadline,
        string calldata _taskDescription,
        bool _autoRefund
    ) external returns (bytes32 taskId);
    
    function releaseWithProof(
        bytes32 _taskId,
        bytes32 _attestationUID,
        bytes calldata _signature
    ) external;
    
    function refund(bytes32 _taskId) external;
}
```

### SDK Usage

```typescript
// Create escrow
const escrow = await client.createEscrow({
  providerAddress: '0xServiceProvider',
  amount: '500',
  taskDescription: 'Build landing page with 5 sections',
  deadlineHours: 72, // 3 days
  autoRefund: true
});

console.log(escrow.taskId); // "0x123..."

// Provider completes task, gets attestation
// Then release funds with proof
const result = await client.releaseEscrow({
  taskId: escrow.taskId,
  attestationUID: '0xProofHash',
  signature: '0x...' // Optional webhook signature
});

// Or refund if deadline passed
const refund = await client.refundEscrow(escrow.taskId);
```

### API Endpoints

**Create Escrow:**
```bash
POST /api/escrow/create

{
  "taskId": "0x...",
  "agentAddress": "0x...",
  "providerAddress": "0x...",
  "amount": "500000000", // 500 MNEE in wei (6 decimals)
  "amountFormatted": "500",
  "taskDescription": "Build landing page",
  "deadline": "2026-01-14T10:00:00Z",
  "autoRefund": true,
  "contractAddress": "0xEscrowContract"
}
```

**Release with Proof:**
```bash
POST /api/escrow/release

{
  "taskId": "0x...",
  "attestationUID": "0x...",
  "signature": "0x..." // Optional
}
```

**Refund:**
```bash
PUT /api/escrow/release

{
  "taskId": "0x..."
}
```

### Database Tracking

```prisma
model EscrowTransaction {
  id                String        @id @default(cuid())
  taskId            String        @unique
  agentAddress      String
  providerAddress   String
  amount            String
  amountFormatted   String
  
  status            EscrowStatus  // ACTIVE, COMPLETED, REFUNDED, DISPUTED
  taskDescription   String
  deadline          DateTime
  autoRefund        Boolean       @default(true)
  
  attestationUID    String?
  contractAddress   String
  
  createdAt         DateTime      @default(now())
  completedAt       DateTime?
  refundedAt        DateTime?
}
```

### Attestation Options

**Option 1: Ethereum Attestation Service (EAS)**
```typescript
// Provider creates attestation on-chain
const attestation = await eas.attest({
  schema: taskCompletionSchemaUID,
  data: {
    taskId: escrowTaskId,
    completed: true,
    evidence: 'https://proof.example.com'
  }
});

// Use attestation UID to release escrow
await client.releaseEscrow({
  taskId,
  attestationUID: attestation.uid
});
```

**Option 2: Webhook-based (Off-chain)**
```typescript
// Backend signs task completion
const signature = await signer.signMessage(
  keccak256(taskId + attestationUID + providerAddress)
);

// Use signature to release escrow
await client.releaseEscrow({
  taskId,
  attestationUID: 'webhook_' + Date.now(),
  signature
});
```

---

## 💰 Feature 3: Idle Yield (Aave V3 Integration)

### What It Does
Automatically deposits idle MNEE balances into Aave V3 lending pool to earn interest, maximizing returns on unused funds.

### How It Works
1. **Idle detection**: System monitors balances for inactivity (default: 24 hours)
2. **Threshold check**: Only deposits if balance > 100 MNEE
3. **Auto-deposit**: Moves funds to Aave V3 supply pool
4. **Yield accrual**: Earns real-time interest (typically 2-7% APY for stablecoins)
5. **Withdraw anytime**: User can withdraw principal + interest instantly

### Architecture

```
┌─────────────────────────────────────────────────┐
│  User Wallet                                    │
│  Balance: 1,500 MNEE                            │
│  Last Activity: 25 hours ago                    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  AaveYieldService                               │
│  • Checks: Balance > 100 ✓                      │
│  • Checks: Idle > 24hrs ✓                       │
│  • Checks: Yield mode enabled ✓                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Aave V3 Pool (Ethereum)                        │
│  • Approves MNEE spending                       │
│  • Calls supply(MNEE, 1500, user, 0)            │
│  • Mints aMNEE tokens to user                   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  User receives aMNEE (interest-bearing)         │
│  • aMNEE Balance: 1,500 (grows over time)       │
│  • APY: ~4.5%                                    │
│  • After 1 year: ~1,567 MNEE                    │
└─────────────────────────────────────────────────┘
```

### Service Layer: `AaveYieldService.ts`

```typescript
import { createAaveYieldService } from '@mnee-connect/sdk/services/AaveYieldService';

const yieldService = createAaveYieldService({
  rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
  walletClient: walletClient
});

// Check if balance is idle
const idleCheck = await yieldService.checkIdleBalance(
  userAddress,
  lastTransactionTimestamp
);

if (idleCheck.isIdle) {
  // Deposit to Aave
  const result = await yieldService.depositToAave({
    amount: idleCheck.idleAmount,
    onBehalfOf: userAddress,
    walletClient: walletClient
  });
  
  console.log(result.txHash); // "0x..."
  console.log(result.aTokenBalance); // "1500.000000"
}

// Get accrued yield
const yield = await yieldService.getAccruedYield(
  userAddress,
  '1500' // Original deposit
);

console.log(yield); // "67.250000" (after some time)
```

### SDK Methods

```typescript
// Enable yield mode
await client.enableYield(true, {
  minIdleBalance: '100',
  idleDurationHours: 24,
  autoYieldEnabled: true
});

// Get yield statistics
const stats = await client.getYieldStats();

console.log(stats.stats.totalDeposited); // "1500.000000"
console.log(stats.stats.totalYield); // "67.250000"
console.log(stats.stats.totalBalance); // "1567.250000"
console.log(stats.stats.activeDepositsCount); // 1
```

### Dashboard UI

**Component:** `YieldModeToggle.tsx`

Features:
- **Toggle switch** to enable/disable yield mode
- **Auto-yield** option for automatic deposits
- **Settings** for minimum balance and idle duration
- **Info box** explaining how it works
- **Real-time feedback** on changes

**Stats Card:** Shows "Accrued Yield" with APY

```tsx
{
  title: 'Accrued Yield',
  value: '67.25 MNEE',
  icon: '🌱',
  color: 'from-emerald-500 to-teal-500',
  subtitle: '4.5% APY'
}
```

### API Endpoints

**Toggle Yield Mode:**
```bash
POST /api/yield/toggle

{
  "userAddress": "0x...",
  "yieldModeEnabled": true,
  "autoYieldEnabled": true,
  "minIdleBalance": "100",
  "idleDurationHours": 24
}
```

**Get Yield Stats:**
```bash
GET /api/yield/stats?userAddress=0x...

Response:
{
  "deposits": [
    {
      "id": "...",
      "depositAmount": "1500000000",
      "depositFormatted": "1500",
      "currentBalance": "1567250000",
      "accruedYield": "67250000",
      "yieldFormatted": "67.25",
      "apy": "4.5",
      "isActive": true,
      "depositedAt": "2026-01-10T12:00:00Z"
    }
  ],
  "stats": {
    "totalDeposited": "1500.000000",
    "totalYield": "67.250000",
    "totalBalance": "1567.250000",
    "activeDepositsCount": 1
  }
}
```

**Record Deposit:**
```bash
POST /api/yield/stats

{
  "userAddress": "0x...",
  "depositAmount": "1500000000",
  "depositFormatted": "1500",
  "currentBalance": "1500000000",
  "accruedYield": "0",
  "yieldFormatted": "0",
  "aavePoolAddress": "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
  "depositTxHash": "0x...",
  "apy": "4.5"
}
```

### Database Tracking

```prisma
model YieldDeposit {
  id                String      @id @default(cuid())
  userAddress       String
  
  depositAmount     String      // Original deposit (wei)
  depositFormatted  String      // Human-readable
  
  currentBalance    String      // Current aToken balance
  accruedYield      String      // Interest earned
  yieldFormatted    String      // Human-readable yield
  
  aavePoolAddress   String
  aTneeTokenAddress String?
  
  isActive          Boolean     @default(true)
  yieldModeEnabled  Boolean     @default(true)
  
  depositTxHash     String?
  withdrawTxHash    String?
  
  depositedAt       DateTime    @default(now())
  withdrawnAt       DateTime?
  lastUpdatedAt     DateTime    @updatedAt
  
  apy               String?
}

model UserSettings {
  id                String   @id @default(cuid())
  userAddress       String   @unique
  
  yieldModeEnabled  Boolean  @default(false)
  minIdleBalance    String   @default("100")
  idleDurationHours Int      @default(24)
  autoYieldEnabled  Boolean  @default(false)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### Aave V3 Integration Details

**Pool Address (Ethereum Mainnet):**
```
0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2
```

**Key Functions:**
- `supply(asset, amount, onBehalfOf, referralCode)` - Deposit tokens
- `withdraw(asset, amount, to)` - Withdraw tokens + interest
- `getUserAccountData(user)` - Get account data including balances

**aToken (aMNEE):**
- Interest-bearing token received when supplying MNEE
- Balance increases over time (rebasing token)
- Can be transferred or used as collateral
- 1:1 redeemable for MNEE + accrued interest

---

## 🧮 Decimal Precision Handling

**Critical:** MNEE has 6 decimals (not 18 like most ERC-20s)

### Conversions

```typescript
// MNEE: 6 decimals
const mneeWei = parseUnits('100.50', 6);     // 100500000n
const mneeFormatted = formatUnits(100500000n, 6); // "100.5"

// ETH: 18 decimals
const ethWei = parseUnits('0.001', 18);      // 1000000000000000n
const ethFormatted = formatUnits(1000000000000000n, 18); // "0.001"

// Gas cost conversion (ETH → MNEE)
const gasCostEth = formatUnits(gasCostWei, 18); // "0.0005"
const gasCostMnee = parseFloat(gasCostEth) * 3000; // "1.5 MNEE" (assuming 1 ETH = 3000 MNEE)
```

### SDK Utilities

```typescript
import { toWei, fromWei, formatMnee } from '@mnee-connect/sdk/utils';

const wei = toWei('100.5');        // 100500000n (6 decimals)
const formatted = fromWei(100500000n); // "100.5"
const display = formatMnee('100.5');   // "100.50 MNEE"
```

---

## 📊 Complete API Reference

### Paymaster
- `POST /api/paymaster/sponsor` - Request gasless transaction
- `GET /api/paymaster/sponsor?userOpHash=0x...` - Get transaction status

### Escrow
- `POST /api/escrow/create` - Create escrow task
- `GET /api/escrow/create?taskId=0x...` - Get task details
- `GET /api/escrow/create?agentAddress=0x...` - Get agent's tasks
- `POST /api/escrow/release` - Release funds with proof
- `PUT /api/escrow/release` - Refund after deadline

### Yield
- `POST /api/yield/toggle` - Enable/disable yield mode
- `GET /api/yield/toggle?userAddress=0x...` - Get yield settings
- `POST /api/yield/stats` - Record yield deposit
- `GET /api/yield/stats?userAddress=0x...` - Get yield statistics
- `PUT /api/yield/stats` - Update deposit (withdrawal)

---

## 🚀 Deployment Checklist

### 1. Environment Setup
```env
# Blockchain
NEXT_PUBLIC_ALCHEMY_API_KEY=...
NEXT_PUBLIC_MNEE_TOKEN_ADDRESS=0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf

# Paymaster (Pimlico)
NEXT_PUBLIC_PIMLICO_API_KEY=...
NEXT_PUBLIC_BUNDLER_URL=...
NEXT_PUBLIC_PAYMASTER_URL=...

# Escrow Contract
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=... # Deploy MneeEscrow.sol first

# Database
DATABASE_URL=postgresql://...
```

### 2. Deploy Smart Contract
```bash
# Deploy MneeEscrow.sol to Ethereum
npx hardhat run scripts/deploy-escrow.js --network mainnet

# Verify on Etherscan
npx hardhat verify --network mainnet ESCROW_ADDRESS MNEE_ADDRESS ATTESTATION_PROVIDER
```

### 3. Database Migration
```bash
# Generate Prisma client with new models
npm run prisma:generate

# Run migration
npm run prisma:migrate dev --name add-agent-commerce-features
```

### 4. Test Each Feature
```bash
# Test gasless payments
npm run test:paymaster

# Test escrow
npm run test:escrow

# Test yield
npm run test:yield
```

---

## 💡 Example Workflows

### Workflow 1: AI Agent Makes Gasless Payment

```typescript
// 1. User authorizes agent with session key
const sessionKey = await client.authorizeAgent({
  spendLimit: '1000',
  duration: 3600
});

// 2. Agent makes gasless payment
const result = await client.sendGaslessPayment({
  to: '0xMerchant',
  amount: '50.25',
  sessionKey: sessionKey,
  maxGasCostInMnee: '5'
});

// 3. Transaction succeeds without agent holding ETH
console.log(`Paid 50.25 MNEE, gas cost: ${result.gasCostInMnee} MNEE`);
```

### Workflow 2: Protect Agent from Scam

```typescript
// 1. Agent creates escrow for task
const escrow = await client.createEscrow({
  providerAddress: '0xFreelancer',
  amount: '500',
  taskDescription: 'Build AI chatbot integration',
  deadlineHours: 120, // 5 days
  autoRefund: true
});

// 2. Provider completes work, submits proof
// (Provider uses EAS or webhook to create attestation)

// 3. Agent verifies and releases funds
const release = await client.releaseEscrow({
  taskId: escrow.taskId,
  attestationUID: '0xProof'
});

// OR if provider fails to deliver:
// 4. Wait for deadline, then refund
setTimeout(async () => {
  const refund = await client.refundEscrow(escrow.taskId);
  console.log('Funds refunded:', refund.escrow.amountFormatted);
}, 5 * 24 * 60 * 60 * 1000); // 5 days
```

### Workflow 3: Earn Passive Income

```typescript
// 1. User enables yield mode
await client.enableYield(true, {
  minIdleBalance: '100',
  idleDurationHours: 24,
  autoYieldEnabled: true
});

// 2. System automatically detects idle balance
// (After 24 hours of no activity)

// 3. System deposits to Aave
// (Happens automatically in background)

// 4. User checks yield anytime
const stats = await client.getYieldStats();
console.log(`Earned ${stats.stats.totalYield} MNEE in interest!`);

// 5. User withdraws anytime (via dashboard)
```

---

## 🔧 Troubleshooting

### Gasless Payments Not Working
- Check Pimlico API key is valid
- Ensure bundler/paymaster URLs are correct
- Verify agent has sufficient MNEE balance (amount + gas)
- Check UserOp simulation for errors

### Escrow Release Failing
- Verify attestation UID is valid
- Check deadline hasn't passed
- Ensure task status is still ACTIVE
- Validate signature if using webhook-based proof

### Yield Not Accruing
- Confirm yield mode is enabled in settings
- Check balance meets minimum threshold (default: 100 MNEE)
- Verify sufficient idle time (default: 24 hours)
- Ensure Aave V3 pool address is correct

---

## 📝 Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

---

## 📚 Additional Resources

- [Permissionless.js Docs](https://docs.pimlico.io/permissionless)
- [Aave V3 Docs](https://docs.aave.com/developers/getting-started/readme)
- [Ethereum Attestation Service](https://attest.sh/)
- [ERC-4337 Spec](https://eips.ethereum.org/EIPS/eip-4337)

---

## 🎉 Summary

Your MNEE Connect platform now supports:

✅ **Gasless MNEE** - AI agents can transact without ETH  
✅ **Proof-of-Task Escrow** - Secure task-based payments  
✅ **Idle Yield** - Automatic interest earning on Aave  

All features are fully integrated with:
- TypeScript SDK methods
- REST API endpoints
- Database tracking (Prisma)
- UI components (React/Next.js)
- Smart contracts (Solidity)

**Next Steps:**
1. Deploy MneeEscrow.sol contract
2. Run Prisma migrations
3. Configure environment variables
4. Test each feature end-to-end
5. Launch to production! 🚀

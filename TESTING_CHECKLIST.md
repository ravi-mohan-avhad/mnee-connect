# ✅ MNEE Connect - Testing Checklist

Complete this checklist to verify all features are working correctly.

## 🎯 Pre-Testing Setup

- [ ] PostgreSQL installed and running
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` configured with valid values
- [ ] Database migrated (`npm run prisma:migrate`)
- [ ] Dev server running (`npm run dev`)
- [ ] MetaMask installed and connected to Ethereum mainnet
- [ ] Wallet has MNEE tokens
- [ ] Wallet has ETH for gas fees

---

## 1️⃣ SDK Core Functionality

### Balance Operations
- [ ] `getBalance()` returns correct MNEE balance
- [ ] Balance formatted correctly (6 decimals)
- [ ] Works with different addresses

### Utility Functions
- [ ] `toWei()` converts correctly (100.5 → 100500000n)
- [ ] `fromWei()` converts correctly (100500000n → "100.5")
- [ ] `formatMnee()` adds MNEE symbol
- [ ] `shortenAddress()` truncates addresses correctly
- [ ] `isValidAddress()` validates Ethereum addresses

### Approval Operations
- [ ] `approve()` sets allowance on blockchain
- [ ] `getAllowance()` returns correct allowance
- [ ] Approval transaction confirms on Etherscan

---

## 2️⃣ Session Key Management (⭐ Core Feature)

### Creation
- [ ] `authorizeAgent()` creates session key
- [ ] Session key has correct spend limit
- [ ] Session key has correct expiration time
- [ ] Private key generated successfully
- [ ] Approval transaction succeeds
- [ ] Session key stored in memory

### Validation
- [ ] Expired session keys rejected
- [ ] Spend limit enforced
- [ ] Remaining limit updates after payment

### Usage
- [ ] `sendPayment()` works with session key
- [ ] Agent can make payment without main account signature
- [ ] Transaction logged as AI_AGENT type
- [ ] Remaining limit decreases correctly

### Revocation
- [ ] `revokeSessionKey()` sets allowance to 0
- [ ] Revoked keys cannot make payments
- [ ] Session key removed from memory

---

## 3️⃣ Payment Operations

### Regular Payments
- [ ] `sendPayment()` transfers MNEE
- [ ] Transaction hash returned
- [ ] Transaction confirms on blockchain
- [ ] Balance updates after payment
- [ ] Receipt has correct status (CONFIRMED)

### Agent Payments
- [ ] Payment works with session key
- [ ] No manual approval required
- [ ] Spend limit checked before payment
- [ ] Payment logged to database

### Error Handling
- [ ] Insufficient balance error shown
- [ ] Invalid address error shown
- [ ] Expired session key error shown
- [ ] Spend limit exceeded error shown

---

## 4️⃣ Web3 Provider & Hooks

### `useMnee()` Hook
- [ ] Returns correct wallet address
- [ ] `isConnected` status accurate
- [ ] Balance loads automatically
- [ ] Balance updates after transaction
- [ ] `sendPayment()` function works
- [ ] `approveSpender()` function works
- [ ] Loading states work correctly
- [ ] Error states handled properly

### Wallet Connection
- [ ] ConnectKit button appears
- [ ] Wallet connects successfully
- [ ] Correct network detected (Ethereum mainnet)
- [ ] Disconnect works properly

---

## 5️⃣ Backend API Routes

### Payment Webhooks
- [ ] `POST /api/webhooks/payment` creates transaction record
- [ ] Duplicate transactions handled (returns existing)
- [ ] Amount formatted correctly in database
- [ ] Transaction status set to CONFIRMED
- [ ] Payer type recorded (HUMAN or AI_AGENT)
- [ ] `GET /api/webhooks/payment?address=0x...` returns transactions
- [ ] Transactions filtered by address correctly
- [ ] Pagination works (limit/offset)

### Session Keys API
- [ ] `POST /api/session-keys` creates record
- [ ] `GET /api/session-keys?owner=0x...` lists keys
- [ ] `activeOnly=true` filters expired keys
- [ ] Private key NOT returned in GET response
- [ ] `DELETE /api/session-keys?id=...` revokes key
- [ ] Revoked keys marked as inactive

### API Keys Management
- [ ] `POST /api/api-keys` generates new key
- [ ] API key format: `mnee_[64 chars]`
- [ ] Key shown only once after creation
- [ ] Key hashed (SHA-256) before storage
- [ ] `GET /api/api-keys?userId=...` lists keys
- [ ] Last used timestamp tracked
- [ ] `DELETE /api/api-keys?id=...` revokes key
- [ ] Revoked keys cannot be used

---

## 6️⃣ Dashboard UI

### Layout & Navigation
- [ ] Sidebar displays correctly
- [ ] Logo and branding visible
- [ ] Navigation links work
- [ ] Wallet connection button functional
- [ ] Responsive on mobile devices

### Stats Cards
- [ ] Current balance displays
- [ ] Total volume calculates correctly
- [ ] Transaction count accurate
- [ ] AI agent count correct
- [ ] Cards update after new transaction

### Transaction Table
- [ ] All transactions display
- [ ] Filter tabs work (All/Sent/Received)
- [ ] Status badges correct colors
  - [ ] CONFIRMED = green
  - [ ] PENDING = yellow
  - [ ] FAILED = red
- [ ] Payer type badges correct
  - [ ] HUMAN = blue
  - [ ] AI_AGENT = purple
- [ ] Etherscan links work
- [ ] Dates formatted correctly
- [ ] Table updates after new payment

### API Key Manager
- [ ] "Create API Key" modal opens
- [ ] Key name input works
- [ ] "Create" button generates key
- [ ] Generated key displayed in modal
- [ ] "Copy to Clipboard" works
- [ ] Key list displays all keys
- [ ] Creation date shown
- [ ] Last used date shown (if used)
- [ ] Active/Revoked status displayed
- [ ] "Revoke" button works
- [ ] Revoked keys grayed out

---

## 7️⃣ Payment Widget

### Display & Input
- [ ] Widget renders correctly
- [ ] Wallet connection prompt shown when disconnected
- [ ] Balance displayed correctly
- [ ] Amount input accepts numbers
- [ ] Fixed amount disabled when set
- [ ] Recipient address displayed
- [ ] Gasless checkbox appears (if enabled)

### Payment Flow
- [ ] "Connect Wallet" works when disconnected
- [ ] Amount validation works (positive numbers)
- [ ] Insufficient balance error shown
- [ ] "Pay" button triggers transaction
- [ ] MetaMask prompt appears
- [ ] Transaction processes after approval
- [ ] Loading state shows during processing

### Success State
- [ ] Success checkmark displayed
- [ ] Transaction hash shown
- [ ] Etherscan link works
- [ ] "Make Another Payment" resets form
- [ ] Balance updates after payment

### Error Handling
- [ ] Error messages display clearly
- [ ] Can retry after error
- [ ] Error logged to console

---

## 8️⃣ Database Operations

### Prisma
- [ ] `npx prisma studio` opens successfully
- [ ] All tables visible in Studio
- [ ] Can view transaction records
- [ ] Can view session key records
- [ ] Can view API key records (hashed)
- [ ] Foreign keys work correctly

### Data Integrity
- [ ] Transaction IDs unique
- [ ] Session key addresses unique
- [ ] API key hashes unique
- [ ] Timestamps recorded correctly
- [ ] Enums enforce correct values

### Analytics
- [ ] Daily analytics aggregated
- [ ] Volume calculations correct
- [ ] Transaction counts accurate
- [ ] Agent vs human split correct

---

## 9️⃣ Landing Page

### Hero Section
- [ ] Gradient title displays
- [ ] Description clear and readable
- [ ] "Get Started" button links to dashboard
- [ ] "View Docs" button works

### Features Grid
- [ ] All 6 feature cards display
- [ ] Icons and titles visible
- [ ] Descriptions readable
- [ ] Hover effects work

### Demo Widget
- [ ] Payment widget embedded
- [ ] Works exactly like standalone widget
- [ ] Connected to real MNEE contract

### Footer
- [ ] Copyright text visible
- [ ] Links functional

---

## 🔟 Documentation

### README.md
- [ ] Installation instructions clear
- [ ] Quick start guide accurate
- [ ] API reference complete
- [ ] Examples work

### SETUP.md
- [ ] Step-by-step setup accurate
- [ ] Troubleshooting helpful
- [ ] Environment variables documented

### PROJECT_SUMMARY.md
- [ ] All features documented
- [ ] Architecture explained
- [ ] File structure accurate

### QUICKSTART.md
- [ ] 5-minute setup realistic
- [ ] Commands work correctly
- [ ] Testing steps accurate

### ARCHITECTURE.md
- [ ] Diagrams clear and helpful
- [ ] Data flows documented
- [ ] Component structure explained

---

## 🚀 Performance Testing

### Load Times
- [ ] Home page loads < 2 seconds
- [ ] Dashboard loads < 2 seconds
- [ ] Transaction table loads < 500ms
- [ ] Stats cards load < 300ms

### Web3 Operations
- [ ] Balance query < 500ms
- [ ] Transaction sent < 5 seconds
- [ ] Session key creation < 10 seconds

### Database Queries
- [ ] Transaction list < 200ms
- [ ] Session key list < 100ms
- [ ] API key list < 100ms

---

## 🔐 Security Testing

### Input Validation
- [ ] Address validation works
- [ ] Amount validation works
- [ ] SQL injection prevented (Prisma)
- [ ] XSS prevented (React escaping)

### Authentication
- [ ] Wallet signature required
- [ ] Session keys time-limited
- [ ] API keys hashed
- [ ] Private keys never exposed in API

### Authorization
- [ ] Users can only see own transactions
- [ ] Session keys limited to approved amount
- [ ] Expired sessions rejected

---

## 📱 Cross-Browser Testing

### Desktop
- [ ] Chrome works
- [ ] Firefox works
- [ ] Edge works
- [ ] Safari works (if Mac available)

### Mobile
- [ ] Responsive layout on mobile
- [ ] Touch interactions work
- [ ] MetaMask mobile browser works

---

## 🎯 End-to-End Scenarios

### Scenario 1: New User Journey
1. [ ] Land on homepage
2. [ ] Click "Get Started"
3. [ ] Connect wallet
4. [ ] View balance in dashboard
5. [ ] Create API key
6. [ ] Copy and save key
7. [ ] Make first payment
8. [ ] See transaction in table

### Scenario 2: AI Agent Setup
1. [ ] Connect wallet
2. [ ] Go to dashboard
3. [ ] Authorize AI agent (session key)
4. [ ] Copy session key details
5. [ ] Make payment with session key
6. [ ] Verify transaction marked as AI_AGENT
7. [ ] Check remaining limit decreased
8. [ ] Revoke session key

### Scenario 3: Developer Integration
1. [ ] Install SDK in new project
2. [ ] Initialize MneeClient
3. [ ] Check balance
4. [ ] Send payment programmatically
5. [ ] Verify on Etherscan
6. [ ] Check webhook received payment

---

## 🐛 Known Issues (Document Any Found)

```
Issue #1:
- Description:
- Steps to reproduce:
- Expected behavior:
- Actual behavior:
- Workaround:

Issue #2:
- Description:
- Steps to reproduce:
- Expected behavior:
- Actual behavior:
- Workaround:
```

---

## ✅ Final Verification

### Code Quality
- [ ] No console errors in browser
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All imports resolve correctly

### Production Readiness
- [ ] Environment variables documented
- [ ] Database migrations work
- [ ] All dependencies in package.json
- [ ] .gitignore configured correctly

### Documentation
- [ ] README complete
- [ ] Setup guide accurate
- [ ] API docs current
- [ ] Examples work

---

## 🎉 Testing Complete!

Date: _______________  
Tester: _______________  
Overall Status: [ ] Pass  [ ] Fail  [ ] Needs Work

**Notes:**
_________________________________________
_________________________________________
_________________________________________

**Sign-off:**
_________________________________________

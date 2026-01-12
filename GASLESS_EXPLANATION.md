# How Gasless Payments Work

## Simple Answer

**Yes, we ARE using blockchain.**

But AI agents don't need ETH for gas fees. Here's why:

### The Problem
- Normal blockchain transactions require **gas fees in ETH**
- AI agents don't have ETH wallets
- Users don't want to fund agent wallets with ETH

### Our Solution: ERC-4337 Gasless Payments

#### 1. **Paymaster Contract** (The Gas Sponsor)
```
Traditional:  Agent pays gas in ETH → Transaction executes
MNEE Connect: Paymaster pays gas in ETH → Deducts fee from MNEE payment
```

Our smart contract (`MneePaymaster`) sponsors the gas fees. Instead of requiring the agent to have ETH, we:
- Pay the gas fee ourselves (in ETH)
- Deduct a small fee from the MNEE payment
- Net result: Agent pays in MNEE, never touches ETH

#### 2. **Account Abstraction (ERC-4337)**
```
Traditional Wallet:  Private Key → Signs Transaction → Needs ETH for gas
Smart Wallet:        Session Key → Pre-Approved → No ETH needed
```

Instead of traditional wallets, we use "smart contract wallets" that can:
- Accept session keys (temporary permissions for agents)
- Bundle multiple transactions together
- Use our Paymaster to cover gas

### Real-World Example

**Without MNEE Connect:**
```
1. AI agent wants to pay merchant 100 MNEE
2. Agent needs 0.01 ETH for gas
3. ❌ Agent doesn't have ETH → Transaction fails
```

**With MNEE Connect:**
```
1. AI agent wants to pay merchant 100 MNEE
2. Agent signs transaction with session key
3. MneePaymaster pays 0.01 ETH gas fee
4. Merchant receives 99.50 MNEE (0.50 MNEE fee covers gas + platform)
5. ✅ Transaction succeeds - agent never needed ETH
```

### How It's "Gasless"

It's not truly gasless - someone still pays the gas. But:
- **From agent's perspective**: Gasless (they only have MNEE, no ETH needed)
- **From merchant's perspective**: Gasless (they receive MNEE minus a fee)
- **From user's perspective**: Gasless (their authorized agents can transact without managing ETH)

The **platform** (MNEE Connect) pays the gas upfront and recoups it via fees.

### The Tech Stack

1. **Blockchain**: Ethereum (Sepolia testnet for demo)
2. **Smart Contracts**: 
   - `MockMNEE.sol`: The MNEE token
   - `MneePaymaster.sol`: Sponsors gas fees
   - `MneeEscrow.sol`: Holds payments until task completion
3. **ERC-4337**: Account Abstraction standard for smart wallets
4. **Pimlico**: Bundler service that submits sponsored transactions

### Comparison to Stripe

| Feature | Stripe | MNEE Connect |
|---------|--------|--------------|
| Payment Method | Credit Card | MNEE Token (ERC-20) |
| Settlement | Bank (2-7 days) | Blockchain (instant) |
| Fees | 2.9% + $0.30 | 0.5% + gas |
| Gas Fees | N/A | Paid by platform |
| For AI Agents | ❌ | ✅ |

### Is This Really Decentralized?

**Partially:**
- ✅ Smart contracts are on-chain (trustless)
- ✅ Transactions are publicly verifiable
- ⚠️ Paymaster is controlled by us (we sponsor gas)
- ⚠️ API keys stored in our database (centralized)

**Why not fully decentralized?**
- Someone has to pay gas fees (requires ETH capital)
- Merchants want familiar dashboard/APIs like Stripe
- Production systems need centralized monitoring

### Demo vs Production

**In Demo Mode:**
- No real blockchain transactions
- Just showing UI/UX flow
- Sample data for presentation

**In Production (with real blockchain):**
1. Deploy contracts to Sepolia testnet
2. Fund Paymaster with testnet ETH
3. User connects MetaMask
4. AI agents use session keys to make real payments
5. All transactions visible on Etherscan

### Bottom Line

**"Gasless"** means agents don't need ETH. They pay in MNEE, we handle the gas fees behind the scenes and take a small cut. It's blockchain-based, just with a better UX for AI agents.

---

**For Demos:** Just explain it as "We sponsor the gas fees so AI agents can pay in MNEE without holding ETH. Like how Stripe handles credit card processing - someone's paying fees, but not the end user."

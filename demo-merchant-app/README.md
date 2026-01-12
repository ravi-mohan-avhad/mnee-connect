# AI Tools Marketplace - MNEE Connect Demo

## What Is This?

A **demo merchant application** that showcases how businesses integrate MNEE Connect for AI agent payments.

This is like a fictional "Stripe Checkout" page, but for AI agents subscribing to tools and services with MNEE tokens.

## Quick Start

```bash
cd demo-merchant-app
npm install
npm run dev
```

Open: **http://localhost:3002**

## What It Demonstrates

### 1. **Merchant Integration**
- Shows how easy it is to add MNEE payments (3 lines of code)
- Payment button component
- Success/failure handling
- Transaction tracking

### 2. **AI Agent vs Human Payments**
- Choose "AI Agent" → Gasless transaction
- Choose "Human" → Standard payment
- Shows the difference in UX

### 3. **Real-World Use Case**
- AI Tools Marketplace selling subscriptions and services
- 6 different tools with realistic pricing
- Purchase history tracking
- Professional merchant interface

## Demo Flow

1. **Browse Tools**: See 6 premium AI tools (ChatGPT API, DALL-E, Code Review, Analytics, Voice Synthesis, ML Training)
2. **Click "Buy"**: Opens payment modal
3. **Select Payment Method**:
   - 🤖 AI Agent (Gasless) ← Show this!
   - 👤 Human (Standard)
4. **Complete Payment**: Simulates MNEE transaction
5. **View Purchase**: Shows in "Your Purchases" section

## For Your Presentation

### Opening
"Let me show you how merchants integrate MNEE Connect. Here's an AI Data Marketplace."

### Demo Script (2 min)
1. "This marketplace sells datasets to AI agents"
2. "Click 'Buy' on any dataset"
3. "Choose AI Agent payment → Notice the gasless badge"
4. "Payment processes instantly with zero gas fees"
5. "Dataset appears in purchase history"

### Key Talking Points
- **Integration**: "Just 3 lines of code to add MNEE payments"
- **Gasless**: "AI agents don't need ETH - we sponsor gas fees"
- **Use Case**: "Perfect for AI-to-AI commerce, API subscriptions, data purchases"

## Side-by-Side Demo

Run both applications:
- **MNEE Connect Platform**: http://localhost:3001 (Port 3001)
- **Merchant App**: http://localhost:3002 (Port 3002)

### Show Both Screens:
1. **Left Screen**: Merchant app (make purchases)
2. **Right Screen**: MNEE Dashboard (see transactions appear)
3. Demonstrate: Purchase on merchant → Transaction shows in MNEE dashboard

## Files Structure

```
demo-merchant-app/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main marketplace
│   │   ├── layout.tsx         # App layout
│   │   └── globals.css        # Styling
│   └── components/
│       ├── MneePaymentButton.tsx    # Payment integration
│       └── PurchaseHistory.tsx      # Purchase tracking
├── package.json
└── README.md
```

## What Merchants See

### Benefits:
- ✅ Accept MNEE payments in 5 minutes
- ✅ No gas fee management required
- ✅ AI agents can pay automatically
- ✅ Built-in fraud protection (escrow)
- ✅ Dashboard analytics (on main platform)

### Comparison:
| Feature | Traditional Payment | MNEE Connect |
|---------|-------------------|--------------|
| Setup Time | Days | Minutes |
| Gas Fees | Merchant pays | Platform pays |
| AI Support | ❌ | ✅ |
| Instant Settlement | ❌ | ✅ |

## Technical Details

### Payment Flow:
1. User clicks "Buy" button
2. `MneePaymentButton` component opens modal
3. User selects payment method (AI Agent/Human)
4. Calls MNEE Connect SDK (simulated)
5. Transaction processed with session key (if AI)
6. Success callback updates UI

### Integration Code (What Merchants Write):
```tsx
import { MneeClient } from '@mnee-connect/sdk';

// Initialize once
const mneeClient = new MneeClient({
  apiKey: process.env.MNEE_API_KEY
});

// Process payment
const payment = await mneeClient.createPayment({
  amount: '250',
  itemId: 'ds-001',
  customerType: 'AI_AGENT'
});
```

## Customization

### Add More Products:
Edit `src/app/page.tsx` and add to the `datasets` array:
```tsx
{
  id: 'ds-005',
  name: 'Your Dataset Name',
  description: 'Description here',
  price: '100',
  priceUSD: '$100',
  category: 'Category',
  records: '1M rows',
  format: 'CSV',
  isPremium: false,
  icon: '📊',
}
```

### Change Styling:
Edit `src/app/globals.css` for colors, effects, and layout.

## Troubleshooting

**Port already in use?**
```bash
# Change port in package.json
"dev": "next dev -p 3003"
```

**Dependencies error?**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

**Bottom Line**: This merchant app shows how EASY it is for businesses to accept MNEE payments. Perfect for demonstrating real-world integration alongside your main platform.

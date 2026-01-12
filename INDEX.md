# 📚 MNEE Connect - Documentation Index

Welcome to MNEE Connect! This index will help you navigate all documentation.

## 🚀 Getting Started (Start Here!)

**For First-Time Users:**
1. **[QUICKSTART.md](./QUICKSTART.md)** ⚡ - Get running in 5 minutes
2. **[README.md](./README.md)** 📖 - Main documentation and features
3. **[SETUP.md](./SETUP.md)** 🔧 - Detailed setup instructions

**Quick Commands:**
```bash
npm install              # Install dependencies
npm run prisma:migrate  # Setup database
npm run dev             # Start development server
```

---

## 📖 Main Documentation

### Overview Documents

| Document | Purpose | Audience |
|----------|---------|----------|
| **[README.md](./README.md)** | Main documentation, features, usage | Everyone |
| **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** | Complete project overview | Developers, reviewers |
| **[QUICKSTART.md](./QUICKSTART.md)** | 5-minute setup guide | New users |
| **[SETUP.md](./SETUP.md)** | Detailed setup instructions | Developers |

### Technical Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | System architecture, data flows | Developers, architects |
| **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** | Complete testing checklist | QA, developers |
| **[packages/sdk/README.md](./packages/sdk/README.md)** | SDK documentation | SDK users |

### Configuration Files

| File | Purpose |
|------|---------|
| **[.env.example](./.env.example)** | Environment variables template |
| **[tsconfig.json](./tsconfig.json)** | TypeScript configuration |
| **[next.config.js](./next.config.js)** | Next.js configuration |
| **[tailwind.config.ts](./tailwind.config.ts)** | TailwindCSS configuration |
| **[prisma/schema.prisma](./prisma/schema.prisma)** | Database schema |

---

## 🎯 Documentation by Use Case

### I want to... Use the SDK

**Read:**
1. [packages/sdk/README.md](./packages/sdk/README.md) - SDK documentation
2. [examples/sdk-usage.ts](./examples/sdk-usage.ts) - 10 code examples
3. [README.md - SDK Usage Section](./README.md#-sdk-usage)

**Key Files:**
- `packages/sdk/src/MneeClient.ts` - Main SDK class
- `packages/sdk/src/constants.ts` - Token config & ABI
- `packages/sdk/src/utils.ts` - Helper functions

---

### I want to... Set Up the Project

**Read:**
1. [QUICKSTART.md](./QUICKSTART.md) - Fast setup (5 min)
2. [SETUP.md](./SETUP.md) - Detailed setup
3. [.env.example](./.env.example) - Environment variables

**Commands:**
```bash
# Quick setup
npm install
npm run prisma:migrate
npm run dev
```

---

### I want to... Understand the Architecture

**Read:**
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete architecture
2. [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Project overview
3. [prisma/schema.prisma](./prisma/schema.prisma) - Database design

**Key Concepts:**
- Clean Architecture (SDK, API, UI, Data layers)
- Session Keys for AI agents
- ERC-20 integration with Viem

---

### I want to... Build a Payment Widget

**Read:**
1. [src/components/PaymentWidget.tsx](./src/components/PaymentWidget.tsx) - Widget source
2. [src/hooks/useMnee.ts](./src/hooks/useMnee.ts) - Custom hook
3. [README.md - Payment Widget](./README.md)

**Example:**
```tsx
<PaymentWidget
  recipientAddress="0x..."
  amount="50"
  enableGasless={true}
/>
```

---

### I want to... Integrate with My App

**Read:**
1. [packages/sdk/README.md](./packages/sdk/README.md) - SDK docs
2. [examples/sdk-usage.ts](./examples/sdk-usage.ts) - Examples
3. [README.md - API Reference](./README.md#-api-reference)

**Steps:**
1. Install SDK: `npm install @mnee-connect/sdk viem`
2. Initialize client with RPC URL
3. Call methods: `getBalance()`, `sendPayment()`, etc.

---

### I want to... Set Up AI Agent Payments

**Read:**
1. [README.md - AI Agent Authorization](./README.md#ai-agent-authorization)
2. [examples/sdk-usage.ts - Example 3](./examples/sdk-usage.ts#example-3)
3. [packages/sdk/src/MneeClient.ts - authorizeAgent()](./packages/sdk/src/MneeClient.ts)

**Key Concepts:**
- Session keys with spend limits
- Time-based expiration
- Autonomous payments without manual approval

---

### I want to... Test Everything

**Read:**
1. [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) - Complete checklist
2. [QUICKSTART.md - Testing](./QUICKSTART.md#-testing-the-platform)

**Test Categories:**
- SDK functionality (10 items)
- Session keys (15 items)
- Payment operations (10 items)
- Dashboard UI (30 items)
- API routes (20 items)

---

### I want to... Deploy to Production

**Read:**
1. [README.md - Production Checklist](./README.md#production-checklist)
2. [SETUP.md - Production](./SETUP.md)
3. [PROJECT_SUMMARY.md - Deployment](./PROJECT_SUMMARY.md#-deployment-architecture)

**Steps:**
1. Deploy to Vercel
2. Set up Supabase/Neon for PostgreSQL
3. Configure environment variables
4. Enable monitoring

---

## 📂 File Structure Reference

```
mnee-connect/
├── 📄 Documentation (You are here!)
│   ├── README.md                  # Main documentation
│   ├── QUICKSTART.md              # 5-minute setup
│   ├── SETUP.md                   # Detailed setup
│   ├── PROJECT_SUMMARY.md         # Complete overview
│   ├── ARCHITECTURE.md            # System architecture
│   ├── TESTING_CHECKLIST.md       # Testing guide
│   └── INDEX.md                   # This file
│
├── 📦 SDK Package
│   └── packages/sdk/
│       ├── README.md              # SDK documentation
│       └── src/
│           ├── MneeClient.ts      # ⭐ Main SDK class
│           ├── constants.ts       # Config & ABIs
│           ├── utils.ts           # Helpers
│           └── index.ts           # Exports
│
├── 🎨 Frontend
│   └── src/
│       ├── app/
│       │   ├── page.tsx           # Landing page
│       │   ├── dashboard/         # Dashboard pages
│       │   └── api/               # API routes
│       ├── components/
│       │   ├── PaymentWidget.tsx  # Payment component
│       │   └── dashboard/         # Dashboard components
│       ├── hooks/
│       │   └── useMnee.ts         # MNEE hook
│       └── lib/
│           ├── prisma.ts          # Database client
│           └── web3-provider.tsx  # Web3 config
│
├── 🗄️ Database
│   └── prisma/
│       └── schema.prisma          # Database schema
│
├── 📝 Examples
│   └── examples/
│       └── sdk-usage.ts           # 10 SDK examples
│
└── ⚙️ Configuration
    ├── .env.example               # Environment template
    ├── tsconfig.json              # TypeScript config
    ├── next.config.js             # Next.js config
    ├── tailwind.config.ts         # Tailwind config
    └── package.json               # Dependencies
```

---

## 🎓 Learning Path

### Beginner (New to MNEE Connect)

1. Read [README.md](./README.md) - Understand what it does
2. Follow [QUICKSTART.md](./QUICKSTART.md) - Get it running
3. Try demo on homepage - Make a test payment
4. Explore dashboard - See transactions and API keys

**Time:** ~30 minutes

---

### Intermediate (Developer Integration)

1. Read [packages/sdk/README.md](./packages/sdk/README.md)
2. Study [examples/sdk-usage.ts](./examples/sdk-usage.ts)
3. Try SDK examples in your own project
4. Create session key for AI agent
5. Make payment with session key

**Time:** ~2 hours

---

### Advanced (Full Integration)

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Study all source code
3. Customize for your use case
4. Implement webhooks
5. Deploy to production
6. Set up monitoring

**Time:** ~1 day

---

## 🔍 Quick Reference

### Most Important Files

**For Understanding:**
- [README.md](./README.md) - Start here
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Complete overview

**For Setup:**
- [QUICKSTART.md](./QUICKSTART.md) - Fast setup
- [.env.example](./.env.example) - Configuration

**For Development:**
- [packages/sdk/src/MneeClient.ts](./packages/sdk/src/MneeClient.ts) - Core logic
- [examples/sdk-usage.ts](./examples/sdk-usage.ts) - Examples

**For Testing:**
- [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) - Complete checklist

---

## 📊 Document Statistics

| Category | Count | Lines |
|----------|-------|-------|
| Documentation Files | 8 | ~3,000 |
| Source Code Files | 27 | ~3,500 |
| Configuration Files | 8 | ~500 |
| Total | 43 | ~7,000 |

---

## 🎯 Common Questions

### Q: Where do I start?
**A:** Read [QUICKSTART.md](./QUICKSTART.md) for a 5-minute setup guide.

### Q: How do I use the SDK?
**A:** See [packages/sdk/README.md](./packages/sdk/README.md) and [examples/sdk-usage.ts](./examples/sdk-usage.ts)

### Q: How do session keys work?
**A:** See [README.md - AI Agent Authorization](./README.md#ai-agent-authorization) and Example 3 in examples file.

### Q: How do I customize the UI?
**A:** Edit files in `src/components/` and `src/app/`. Styling in `src/app/globals.css`.

### Q: Where are the API routes?
**A:** In `src/app/api/`. Three main routes: webhooks/payment, session-keys, api-keys.

### Q: How do I deploy this?
**A:** Follow production checklist in [README.md](./README.md#production-checklist).

### Q: What if I find a bug?
**A:** Document it in [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) under "Known Issues".

---

## 🔗 External Resources

### Web3 Libraries
- **Viem**: https://viem.sh
- **Wagmi**: https://wagmi.sh
- **ConnectKit**: https://docs.family.co/connectkit

### Frameworks
- **Next.js 14**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **TailwindCSS**: https://tailwindcss.com/docs

### Blockchain
- **MNEE Token**: https://etherscan.io/token/0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf
- **ERC-4337**: https://eips.ethereum.org/EIPS/eip-4337
- **Alchemy**: https://www.alchemy.com/

---

## 📝 Contributing

Want to improve the documentation?

1. Find the relevant `.md` file
2. Make your edits
3. Submit a pull request
4. Update this index if adding new files

---

## ✅ Documentation Checklist

Use this to ensure all docs are up-to-date:

- [x] README.md - Main docs
- [x] QUICKSTART.md - Setup guide
- [x] SETUP.md - Detailed setup
- [x] PROJECT_SUMMARY.md - Overview
- [x] ARCHITECTURE.md - Architecture
- [x] TESTING_CHECKLIST.md - Testing
- [x] packages/sdk/README.md - SDK docs
- [x] examples/sdk-usage.ts - Examples
- [x] .env.example - Config template
- [x] INDEX.md - This file

---

## 🎉 You're All Set!

Choose your path:
- 🚀 **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)
- 📚 **Learn**: [README.md](./README.md)
- 🔨 **Build**: [packages/sdk/README.md](./packages/sdk/README.md)
- 🧪 **Test**: [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)

**Happy Building! 💪**

---

*Last Updated: January 11, 2026*  
*MNEE Connect v1.0.0*

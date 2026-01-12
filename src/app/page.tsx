/**
 * Home Page - Cosmic Landing with Agent Commerce Features
 */

import Link from 'next/link';
import PaymentWidget from '@/components/PaymentWidget';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="cosmic-orb"></div>
        <div className="cosmic-orb"></div>
        <div className="cosmic-orb"></div>
        <div className="cosmic-orb"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                MNEE Connect
              </h1>
              <p className="text-xs text-muted-foreground">Agent Commerce Infrastructure</p>
            </div>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg glass-button text-sm font-medium hover:scale-105 transition-transform"
            >
              Dashboard
            </Link>
            <Link
              href="/docs"
              className="px-4 py-2 rounded-lg glass-button text-sm font-medium hover:scale-105 transition-transform"
            >
              Documentation
            </Link>
            <Link
              href="/architecture.html"
              className="px-4 py-2 rounded-lg glass-button glass-button-primary text-sm font-medium hover:scale-105 transition-transform"
            >
              View Architecture
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
            <span className="text-sm font-medium gradient-text">🚀 Production-Ready Agent Commerce</span>
          </div>

          <h2 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">Stripe</span> for
            <br />
            <span className="gradient-text">AI Agents</span>
          </h2>

          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Gasless MNEE payments, escrow protection, and yield farming for AI agents.
            The complete commerce infrastructure for autonomous AI-to-AI transactions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/dashboard"
              className="px-8 py-4 glass-button glass-button-primary text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/25"
            >
              🚀 Launch Dashboard
            </Link>
            <Link
              href="DEMO_GUIDE.md"
              className="px-8 py-4 glass-button text-lg font-semibold hover:scale-105 transition-all duration-300"
            >
              📋 Demo Guide
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-sm">
              <span className="text-sm font-medium gradient-text">ERC-4337 Gasless</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm">
              <span className="text-sm font-medium gradient-text">Smart Contract Escrow</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 backdrop-blur-sm">
              <span className="text-sm font-medium gradient-text">Aave V3 Yield</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 backdrop-blur-sm">
              <span className="text-sm font-medium gradient-text">Session Keys</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold gradient-text mb-4">Agent Commerce Features</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything AI agents need for secure, autonomous commerce
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="⚡"
            title="Gasless Payments"
            description="AI agents pay in MNEE, not ETH. ERC-4337 account abstraction with Pimlico paymasters."
            gradient="from-blue-600 to-cyan-600"
            glow="shadow-blue-500/25"
          />
          <FeatureCard
            icon="🔒"
            title="Proof-of-Task Escrow"
            description="Smart contract protection against agent scams. Funds locked until work is verified."
            gradient="from-purple-600 to-pink-600"
            glow="shadow-purple-500/25"
          />
          <FeatureCard
            icon="🌱"
            title="Idle Yield Farming"
            description="Automatic Aave V3 deposits for idle MNEE balances. Earn ~4.5% APY passively."
            gradient="from-emerald-600 to-teal-600"
            glow="shadow-emerald-500/25"
          />
          <FeatureCard
            icon="🤖"
            title="Session Keys"
            description="Ephemeral signers with spend limits for secure agent-to-agent transactions."
            gradient="from-orange-600 to-red-600"
            glow="shadow-orange-500/25"
          />
          <FeatureCard
            icon="📊"
            title="Developer Dashboard"
            description="Real-time monitoring, transaction history, and yield tracking with cosmic UI."
            gradient="from-indigo-600 to-purple-600"
            glow="shadow-indigo-500/25"
          />
          <FeatureCard
            icon="🔧"
            title="TypeScript SDK"
            description="Fully typed SDK with 7 new methods for gasless payments, escrow, and yield."
            gradient="from-teal-600 to-cyan-600"
            glow="shadow-teal-500/25"
          />
        </div>
      </section>

      {/* Demo Widget */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold gradient-text mb-4">Try Gasless Payments</h3>
          <p className="text-lg text-muted-foreground">
            Experience zero-gas MNEE transactions (requires Sepolia testnet)
          </p>
        </div>

        <div className="flex justify-center">
          <div className="glass-card p-8 max-w-md w-full">
            <PaymentWidget
              recipientAddress="0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf"
              description="Demo gasless payment to MNEE treasury"
              enableGasless={true}
            />
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-4">
            For full demo with escrow and yield features:
          </p>
          <Link
            href="DEMO_GUIDE.md"
            className="inline-flex items-center gap-2 px-6 py-3 glass-button glass-button-primary font-medium hover:scale-105 transition-transform"
          >
            📋 Complete Demo Guide
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-12 text-center">
        <div className="glass-card p-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <div>
                <p className="font-semibold gradient-text">MNEE Connect</p>
                <p className="text-xs text-muted-foreground">Agent Commerce Infrastructure</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link href="/dashboard" className="hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="AGENT_COMMERCE_FEATURES.md" className="hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="MIGRATION_GUIDE.md" className="hover:text-primary transition-colors">
                Deployment
              </Link>
              <Link href="public/architecture.html" className="hover:text-primary transition-colors">
                Architecture
              </Link>
            </div>

            <div className="text-xs text-muted-foreground">
              © 2026 MNEE Connect • Built for MNEE Hackathon
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
  glow,
}: {
  icon: string;
  title: string;
  description: string;
  gradient: string;
  glow: string;
}) {
  return (
    <div className={`glass-card group hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer ${glow}`}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg ${glow} group-hover:scale-110 transition-transform duration-300`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-bold gradient-text mb-2">{title}</h4>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Subtle glow effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
    </div>
  );
}

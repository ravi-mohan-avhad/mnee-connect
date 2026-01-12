/**
 * Documentation Page
 * Comprehensive guide for MNEE Connect SDK and Agent Commerce
 */

'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function DocsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-12 py-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold gradient-text">Developer Documentation</h1>
          <p className="text-xl text-muted-foreground">
            Learn how to integrate MNEE Connect into your AI applications
          </p>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DocCard 
            title="Getting Started" 
            description="Install the SDK and configure your first agent in minutes."
            icon="🚀"
          />
          <DocCard 
            title="Gasless Payments" 
            description="Enable ERC-4337 sponsored transactions with Pimlico."
            icon="⚡"
          />
          <DocCard 
            title="Session Keys" 
            description="Authorize autonomous spending with strict limits."
            icon="🤖"
          />
          <DocCard 
            title="Escrow Protocol" 
            description="Implement proof-of-task verification for secure commerce."
            icon="🔒"
          />
        </div>

        {/* Content */}
        <section id="quick-start" className="glass-card p-10 space-y-6">
          <h2 className="text-3xl font-bold gradient-text">Quick Start with TypeScript SDK</h2>
          <div className="bg-black/40 rounded-xl p-6 font-mono text-sm text-blue-300 border border-white/10">
            <p className="text-muted-foreground mb-4"># Install the SDK</p>
            <p>npm install @mnee-connect/sdk viem</p>
            
            <p className="text-muted-foreground mt-8 mb-4">// Initialize the client</p>
            <p>import {'{ MneeClient }'} from '@mnee-connect/sdk';</p>
            <p>const client = new MneeClient({'{'}</p>
            <p className="ml-4">rpcUrl: 'https://...',</p>
            <p className="ml-4">apiKey: 'your_api_key'</p>
            <p>{'}'});</p>

            <p className="text-muted-foreground mt-8 mb-4">// Authorize an agent</p>
            <p>const sessionKey = await client.authorizeAgent({'{'}</p>
            <p className="ml-4">label: 'Data Processing Agent',</p>
            <p className="ml-4">spendLimit: '50.00',</p>
            <p className="ml-4">durationHours: 24</p>
            <p>{'}'});</p>
          </div>
        </section>

        {/* Footer info */}
        <div className="text-center text-muted-foreground">
            <p>Need help? Join our <span className="text-blue-400 cursor-pointer hover:underline">Discord Support</span></p>
        </div>
      </div>
    </DashboardLayout>
  );
}

function DocCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  const scrollToSection = () => {
    const element = document.getElementById('quick-start');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div 
      onClick={scrollToSection}
      className="glass-card group hover:translate-y-[-4px] transition-all cursor-pointer"
    >
      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">{icon}</div>
      <h3 className="text-xl font-bold gradient-text mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

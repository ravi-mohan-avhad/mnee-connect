'use client';

import { useState } from 'react';
import MneePaymentButton from '@/components/MneePaymentButton';
import PurchaseHistory from '@/components/PurchaseHistory';

interface Dataset {
  id: string;
  name: string;
  description: string;
  price: string;
  priceUSD: string;
  category: string;
  features: string;
  provider: string;
  rating: number;
  icon: string;
}

const datasets: Dataset[] = [
  {
    id: 'ai-001',
    name: 'ChatGPT API Access - Monthly',
    description: 'Unlimited access to GPT-4 for text generation, conversation, and analysis. Perfect for AI agents building chatbots or content creators.',
    price: '29',
    priceUSD: '$29/month',
    category: 'Language Models',
    features: 'GPT-4, 100K tokens/month, REST API',
    provider: 'OpenAI',
    rating: 4.8,
    icon: '◆',
  },
  {
    id: 'ai-002',
    name: 'DALL-E Image Generation Tool',
    description: 'Generate high-quality images from text prompts. Ideal for AI agents creating marketing materials or visual content.',
    price: '15',
    priceUSD: '$15/100 images',
    category: 'Image Generation',
    features: '1024x1024 resolution, API access, Commercial use',
    provider: 'OpenAI',
    rating: 4.7,
    icon: '◇',
  },
  {
    id: 'ai-003',
    name: 'Code Review & Optimization Service',
    description: 'AI-powered code analysis and optimization. Get instant feedback on code quality, security, and performance.',
    price: '49',
    priceUSD: '$49/project',
    category: 'Development Tools',
    features: 'Security scan, Performance tips, GitHub integration',
    provider: 'GitHub Copilot',
    rating: 4.9,
    icon: '▣',
  },
  {
    id: 'ai-004',
    name: 'Data Analytics Dashboard',
    description: 'Real-time data visualization and insights. Connect to any data source for automated reporting and alerts.',
    price: '99',
    priceUSD: '$99/month',
    category: 'Analytics',
    features: 'Custom dashboards, API connectors, Real-time updates',
    provider: 'Tableau',
    rating: 4.6,
    icon: '◈',
  },
  {
    id: 'ai-005',
    name: 'Voice Synthesis API',
    description: 'Convert text to natural-sounding speech. Multiple voices and languages for AI assistants and audiobooks.',
    price: '25',
    priceUSD: '$25/1M characters',
    category: 'Speech',
    features: '50+ voices, 25 languages, SSML support',
    provider: 'Google Cloud',
    rating: 4.5,
    icon: '◉',
  },
  {
    id: 'ai-006',
    name: 'Machine Learning Model Training',
    description: 'Custom ML model training service. Upload your data and get a trained model in hours, not weeks.',
    price: '199',
    priceUSD: '$199/model',
    category: 'ML Training',
    features: 'GPU acceleration, Auto-tuning, Model export',
    provider: 'AWS SageMaker',
    rating: 4.8,
    icon: '◐',
  },
];

export default function Home() {
  const [purchasedDatasets, setPurchasedDatasets] = useState<string[]>([]);

  const handlePaymentSuccess = (datasetId: string, txHash: string) => {
    setPurchasedDatasets([...purchasedDatasets, datasetId]);
    console.log(`Payment successful! Tool ${datasetId} purchased. TX: ${txHash}`);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="inline-block mb-4 px-4 py-2 glass-card">
            <span className="text-sm font-semibold">◇ Powered by MNEE Protocol</span>
          </div>
          <h1 className="text-6xl font-bold mb-4">
            <span className="gradient-text">AI Tools Marketplace</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Subscribe to premium AI tools and services with MNEE.
            <br />
            <strong className="text-purple-400">Gasless payments</strong> for AI agents - no ETH required.
          </p>
        </header>

        {/* Integration Banner */}
        <div className="glass-card mb-12 border-2 border-purple-500/30">
          <div className="flex items-center gap-4">
            <div className="text-4xl text-purple-400">●</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold gradient-text mb-2">MNEE Connect Integration Demo</h3>
              <p className="text-gray-400 text-sm">
                This marketplace integrates MNEE Connect SDK in just 3 lines of code.
                AI agents can subscribe to tools with gasless transactions using session keys.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-400">{purchasedDatasets.length}</div>
              <div className="text-xs text-gray-500 uppercase">Purchases Made</div>
            </div>
          </div>
        </div>

        {/* Datasets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {datasets.map((dataset) => {
            const isPurchased = purchasedDatasets.includes(dataset.id);
            
            return (
              <div key={dataset.id} className="glass-card hover:scale-[1.02] transition-all relative">
                
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center text-3xl font-bold text-purple-300">{dataset.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{dataset.name}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{dataset.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-white/5 rounded-xl">
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Category</div>
                    <div className="text-sm font-semibold">{dataset.category}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Features</div>
                    <div className="text-sm font-semibold">{dataset.features}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Provider</div>
                    <div className="text-sm font-semibold">{dataset.provider}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="text-yellow-400">⭐</div>
                    <span className="text-sm font-semibold">{dataset.rating}/5</span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold gradient-text">{dataset.price} MNEE</div>
                    <div className="text-sm text-gray-500">≈ {dataset.priceUSD}</div>
                  </div>
                </div>

                {isPurchased ? (
                  <div className="flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                    <span className="text-green-400 font-semibold">✓ Purchased</span>
                  </div>
                ) : (
                  <MneePaymentButton
                    datasetId={dataset.id}
                    amount={dataset.price}
                    label={`Buy for ${dataset.price} MNEE`}
                    onSuccess={(txHash) => handlePaymentSuccess(dataset.id, txHash)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Purchase History */}
        {purchasedDatasets.length > 0 && (
          <PurchaseHistory purchases={purchasedDatasets} datasets={datasets} />
        )}

        {/* Integration Code */}
        <div className="glass-card mt-12">
          <h3 className="text-2xl font-bold gradient-text mb-4">How This Works (For Developers)</h3>
          <p className="text-gray-400 mb-6">
            This marketplace integrated MNEE Connect in under 5 minutes. Here's the complete code:
          </p>
          <div className="bg-black/40 rounded-xl p-6 font-mono text-sm overflow-x-auto border border-white/10">
            <pre className="text-purple-300">{`// 1. Install MNEE Connect SDK
npm install @mnee-connect/sdk

// 2. Import and initialize
import { MneeClient } from '@mnee-connect/sdk';

const mneeClient = new MneeClient({
  apiKey: process.env.MNEE_API_KEY,
  merchantId: 'your-merchant-id'
});

// 3. Process payment for AI tool subscription
const result = await mneeClient.payments.create({
  amount: '29', // MNEE amount
  description: 'ChatGPT API Access - Monthly',
  customerType: 'ai_agent' // Gasless payment
});

// Done! Payment processed with zero gas fees for the agent.`}</pre>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Powered by <span className="text-purple-400 font-semibold">MNEE Connect</span> • The Stripe for AI Agents</p>
          <p className="mt-2">Visit <a href="http://localhost:3001" className="text-purple-400 hover:underline">MNEE Connect Dashboard</a> to manage your payments</p>
        </footer>
      </div>
    </div>
  );
}

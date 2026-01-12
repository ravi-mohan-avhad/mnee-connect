/**
 * Stats Cards Component
 * Displays key metrics in cosmic glassmorphism cards
 */

'use client';

import { useEffect, useState } from 'react';
import { useMnee } from '@/hooks/useMnee';

interface Stats {
  totalVolume: string;
  transactionCount: number;
  agentTransactions: number;
  humanTransactions: number;
  yieldEarned: string;
  yieldApy: string;
}

export default function StatsCards() {
  const { address, balance } = useMnee();
  const [demoMode, setDemoMode] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalVolume: demoMode ? '12,458.50' : '0',
    transactionCount: demoMode ? 47 : 0,
    agentTransactions: demoMode ? 32 : 0,
    humanTransactions: demoMode ? 15 : 0,
    yieldEarned: demoMode ? '145.823456' : '0',
    yieldApy: '4.5',
  });
  const [isSeeding, setIsSeeding] = useState(false);

  const fetchStats = async () => {
    if (!address) return;
    try {
      // Fetch transaction stats
      const response = await fetch(`/api/webhooks/payment?address=${address}`);
      const data = await response.json();

      // Calculate transaction stats
      const transactions = data.transactions || [];
      const totalVolume = transactions.reduce(
        (sum: number, tx: any) => sum + parseFloat(tx.amountFormatted || '0'),
        0
      );
      const agentCount = transactions.filter((tx: any) => tx.payerType === 'AI_AGENT').length;
      const humanCount = transactions.filter((tx: any) => tx.payerType === 'HUMAN').length;

      // Fetch yield stats
      let yieldEarned = '0';
      let yieldApy = '0';
      try {
        const yieldResponse = await fetch(`/api/yield/stats?userAddress=${address}`);
        const yieldData = await yieldResponse.json();
        if (yieldData.stats) {
          yieldEarned = yieldData.stats.totalYield || '0';
        }
        // Fetch APY (in production, this would come from Aave contract)
        yieldApy = '4.5'; // Placeholder APY
      } catch (yieldError) {
        console.error('Error fetching yield stats:', yieldError);
      }

      setStats({
        totalVolume: totalVolume.toFixed(2),
        transactionCount: transactions.length,
        agentTransactions: agentCount,
        humanTransactions: humanCount,
        yieldEarned,
        yieldApy,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    if (!address) return;
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [address]);

  const handleSeedData = async () => {
    if (!address) return;
    setIsSeeding(true);
    try {
      await fetch('/api/demo/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      await fetchStats();
      // Force reload to see changes in other components
      window.location.reload();
    } catch (error) {
      console.error('Failed to seed data:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  // Demo mode banner (no wallet required)
  const demoBanner = (
    <div className="glass-card p-4 mb-4 border-2 border-blue-500/30">
      <div className="flex items-center gap-3">
        <div className="text-2xl">▣</div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm gradient-text">Demo Mode Active</h4>
          <p className="text-xs text-muted-foreground">Showing realistic sample data. Connect wallet for live transactions.</p>
        </div>
        {!address && (
          <button className="px-3 py-1 text-xs rounded-lg glass-button hover:scale-105 transition-all">
            Connect Wallet (Optional)
          </button>
        )}
      </div>
    </div>
  );

  const cards = [
    {
      title: 'Current Balance',
      value: demoMode ? '8,542.75 MNEE' : (balance ? `${parseFloat(balance).toFixed(2)} MNEE` : '0 MNEE'),
      icon: '◉',
      gradient: 'from-blue-600 to-cyan-600',
      description: 'Available MNEE tokens',
    },
    {
      title: 'Total Volume',
      value: `${stats.totalVolume} MNEE`,
      icon: '◐',
      gradient: 'from-purple-600 to-pink-600',
      description: 'Lifetime transaction volume',
    },
    {
      title: 'Total Transactions',
      value: stats.transactionCount.toString(),
      icon: '◈',
      gradient: 'from-green-600 to-emerald-600',
      description: 'All payment transactions',
    },
    {
      title: 'AI Agent Payments',
      value: stats.agentTransactions.toString(),
      icon: '◆',
      gradient: 'from-orange-600 to-red-600',
      description: 'Gasless agent transactions',
    },
    {
      title: 'Accrued Yield',
      value: `${parseFloat(stats.yieldEarned).toFixed(6)} MNEE`,
      icon: '◇',
      gradient: 'from-emerald-600 to-teal-600',
      subtitle: `${stats.yieldApy}% APY`,
      description: 'Aave V3 yield earnings',
    },
  ];

  return (
    <>
      {demoBanner}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="glass-card group hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {card.title}
              </div>
              <div className="text-xs text-muted-foreground/70">
                {card.description}
              </div>
            </div>
            <div className={`text-3xl bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
              {card.icon}
            </div>
          </div>

          <div className="space-y-2">
            <div className={`text-2xl font-bold tracking-tight bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
              {card.value}
            </div>
            {card.subtitle && (
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground font-medium">
                  {card.subtitle}
                </div>
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${card.gradient} animate-pulse`}></div>
              </div>
            )}
          </div>

          {/* Subtle glow effect */}
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
        </div>
      ))}
      </div>
    </>
  );
}


/**
 * Main Dashboard Page
 * Stripe-inspired developer dashboard
 */

import { Suspense } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import TransactionTable from '@/components/dashboard/TransactionTable';
import StatsCards from '@/components/dashboard/StatsCards';
import ApiKeyManager from '@/components/dashboard/ApiKeyManager';
import YieldModeToggle from '@/components/dashboard/YieldModeToggle';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="relative">
          <h1 className="text-4xl font-bold tracking-tight gradient-text">Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Monitor your MNEE payments and manage agent commerce infrastructure
          </p>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
        </div>

        {/* Stats Overview */}
        <Suspense fallback={<div className="h-48 glass-card animate-pulse" />}>
          <StatsCards />
        </Suspense>

        {/* Agent Commerce Features Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Yield Farming Toggle */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
              <span>◐</span> Passive Yield
            </h2>
            <YieldModeToggle />
          </section>

          {/* API Key Management */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
              <span>◈</span> Developer Access
            </h2>
            <ApiKeyManager />
          </section>
        </div>

        {/* Recent Transactions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
              <span>◉</span> Recent Activity
            </h2>
            <div className="text-sm text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10">
              Live updates enabled
            </div>
          </div>
          <TransactionTable />
        </section>
      </div>
    </DashboardLayout>
  );
}

/**
 * API Keys Page
 * Manage developer credentials for agent commerce
 */

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ApiKeyManager from '@/components/dashboard/ApiKeyManager';

export default function ApiKeysPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight gradient-text">API Keys</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your API keys for programmatic MNEE payments and agent integrations
          </p>
        </div>

        <section>
          <ApiKeyManager />
        </section>

        {/* Info Card */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold gradient-text mb-4">Programmable Payments</h3>
          <p className="text-muted-foreground leading-relaxed">
            Use these keys with our TypeScript SDK to authorize agents, verify escrows, 
            and manage yield farming programmatically. Keep your secret keys safe!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

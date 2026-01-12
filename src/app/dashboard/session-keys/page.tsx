/**
 * Session Keys Page
 * Authorize AI agents with spend limits and expiration
 */

'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useMnee } from '@/hooks/useMnee';
import { formatDate } from '@/lib/format-date';

interface SessionKey {
  id: string;
  label: string;
  address: string;
  spendLimit: string;
  remainingLimit: string;
  expiresAt: string;
  isActive: boolean;
}

export default function SessionKeysPage() {
  const { address } = useMnee();
  const [demoMode] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [spendLimit, setSpendLimit] = useState('100');
  const [expiryDays, setExpiryDays] = useState('7');
  const [keys, setKeys] = useState<SessionKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize demo data on client side only
  useEffect(() => {
    setMounted(true);
    if (demoMode) {
      const demoKeys: SessionKey[] = [
        {
          id: '1',
          label: 'GPT-4 Shopping Agent',
          address: '0x742d35Cc6634C0532925a3b844Bc9e759...',
          spendLimit: '1000',
          remainingLimit: '750',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
        },
        {
          id: '2',
          label: 'Claude Data Analyst',
          address: '0x8f3cf7ad23Cd3CaDbD9735AFf95802323...',
          spendLimit: '500',
          remainingLimit: '425',
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
        },
      ];
      setKeys(demoKeys);
    }
  }, [demoMode]);

  useEffect(() {
    if (address && !demoMode && mounted) {
      fetchKeys();
    }
  }, [address, demoMode]);

  async function fetchKeys() {
    try {
      setLoading(true);
      const response = await fetch(`/api/session-keys?ownerAddress=${address}`);
      const data = await response.json();
      setKeys(data.sessionKeys || []);
    } catch (error) {
      console.error('Error fetching session keys:', error);
    } finally {
      setLoading(false);
    }
  }

  function createSessionKey() {
    if (!newAgentName.trim()) return;
    
    const newKey: SessionKey = {
      id: String(keys.length + 1),
      label: newAgentName,
      address: '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('').substring(0, 40),
      spendLimit,
      remainingLimit: spendLimit,
      expiresAt: new Date(Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    };
    
    setKeys([...keys, newKey]);
    setNewAgentName('');
    setSpendLimit('100');
    setExpiryDays('7');
    setShowCreateModal(false);
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight gradient-text">Session Keys</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Authorize AI agents to spend MNEE with limits
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="glass-button glass-button-primary shadow-lg shadow-blue-500/25"
          >
            + Authorize Agent
          </button>
        </div>

        {/* Info Box */}
        <div className="glass-card-inner p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5">
          <h3 className="text-lg font-bold text-blue-400 mb-2">How Session Keys Work</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Session keys are ephemeral private keys that allow AI agents to sign transactions 
            without your manual approval. You set a specific spend limit and expiration date. 
            Once the limit is reached or the time expires, the agent can no longer move funds.
          </p>
        </div>

        {/* Keys List */}
        <div className="glass-card">
          {loading ? (
            <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-4">
               <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
               <p>Loading session keys...</p>
            </div>
          ) : keys.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <div className="text-4xl mb-4">🤖</div>
              <p>No active session keys found.</p>
              <p className="text-sm">Authorize an agent to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Agent Label</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Address</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Limit</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Remaining</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Expires</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {keys.map((key) => (
                    <tr key={key.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium gradient-text">{key.label}</td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{key.address.slice(0, 10)}...</td>
                      <td className="px-6 py-4">{key.spendLimit} MNEE</td>
                      <td className="px-6 py-4">{key.remainingLimit} MNEE</td>
                      <td className="px-6 py-4 text-sm">{formatDate(key.expiresAt)}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-card p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold gradient-text mb-4">Authorize AI Agent</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Agent Name</label>
                  <input
                    type="text"
                    placeholder="e.g., GPT-4 Shopping Agent"
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    className="w-full px-4 py-3 glass-input rounded-xl bg-background/50 border border-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Spending Limit (MNEE)</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={spendLimit}
                    onChange={(e) => setSpendLimit(e.target.value)}
                    className="w-full px-4 py-3 glass-input rounded-xl bg-background/50 border border-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Expires In (Days)</label>
                  <input
                    type="number"
                    placeholder="7"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    className="w-full px-4 py-3 glass-input rounded-xl bg-background/50 border border-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={createSessionKey}
                  disabled={!newAgentName.trim()}
                  className="flex-1 px-4 py-2 glass-button glass-button-primary font-medium hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                >
                  Authorize Agent
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 glass-button hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

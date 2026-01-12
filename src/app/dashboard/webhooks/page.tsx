/**
 * Webhooks Page
 * Real-time event notifications and delivery logs
 */

'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useMnee } from '@/hooks/useMnee';
import { formatDateTime } from '@/lib/format-date';

interface WebhookLog {
  id: string;
  eventType: string;
  processed: boolean;
  error?: string;
  createdAt: string;
}

export default function WebhooksPage() {
  const { address } = useMnee();
  const [demoMode] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize demo data on client side only
  useEffect(() => {
    setMounted(true);
    if (demoMode) {
      const demoLogs: WebhookLog[] = [
        {
          id: '1',
          eventType: 'payment.succeeded',
          processed: true,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          eventType: 'agent.authorized',
          processed: true,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          eventType: 'escrow.verified',
          processed: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          eventType: 'yield.deposited',
          processed: false,
          error: 'Endpoint timeout',
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
      ];
      setLogs(demoLogs);
    }
  }, [demoMode]);

  useEffect(() => {
    if (address && !demoMode && mounted) {
      fetchLogs();
    }
  }, [address, demoMode, mounted]);

  async function fetchLogs() {
    try {
      setLoading(true);
      const response = await fetch('/api/webhooks/logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }

  function addWebhook() {
    if (!webhookUrl.trim()) return;
    alert(`Demo: Webhook endpoint added!\nURL: ${webhookUrl}\n\nIn production, this would register your endpoint to receive events.`);
    setWebhookUrl('');
    setShowAddModal(false);
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight gradient-text">Webhooks</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Receive real-time notifications for agent commerce events
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="glass-button glass-button-primary shadow-lg shadow-blue-500/25"
          >
            + Add Endpoint
          </button>
        </div>

        {/* Setup Card */}
        <div className="glass-card flex gap-6 items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-3xl shadow-lg">
                🔔
            </div>
            <div className="flex-1">
                <h3 className="text-xl font-bold gradient-text">Configure Webhooks</h3>
                <p className="text-muted-foreground">
                    Connect your backend to receive notifications when agents make payments, 
                    escrow tasks are verified, or yield is deposited.
                </p>
            </div>
        </div>

        {/* Logs Table */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="font-semibold">Recent Event Logs</h3>
          </div>
          {loading ? (
             <div className="py-20 text-center text-muted-foreground">
               <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
               <p>Fetching logs...</p>
             </div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <p>No recent webhook events found.</p>
              <p className="text-sm">Events will appear here once you configure an endpoint.</p>
            </div>
          ) : (
             <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Event Type</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Timestamp</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm">{log.eventType}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${log.processed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {log.processed ? 'Delivered' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatDateTime(log.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-400 hover:underline text-sm">Resend</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          )}
        </div>

        {/* Add Webhook Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-card p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold gradient-text mb-4">Add Webhook Endpoint</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Webhook URL</label>
                  <input
                    type="url"
                    placeholder="https://your-domain.com/webhooks/mnee"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full px-4 py-3 glass-input rounded-xl bg-background/50 border border-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    We'll send POST requests to this URL with event data
                  </p>
                </div>
                <div className="glass-card-inner p-4 rounded-xl">
                  <h4 className="text-sm font-semibold mb-2">Available Events:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• payment.succeeded - Agent payment completed</li>
                    <li>• agent.authorized - New session key created</li>
                    <li>• escrow.verified - Task proof verified</li>
                    <li>• yield.deposited - Aave yield earned</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={addWebhook}
                  disabled={!webhookUrl.trim()}
                  className="flex-1 px-4 py-2 glass-button glass-button-primary font-medium hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                >
                  Add Endpoint
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
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

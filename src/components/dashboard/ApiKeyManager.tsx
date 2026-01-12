/**
 * API Key Manager Component
 * Create and manage developer API keys
 */

'use client';

import { useState, useEffect } from 'react';
import { useMnee } from '@/hooks/useMnee';
import { formatDate } from '@/lib/format-date';

interface ApiKey {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  lastUsedAt?: string;
  isActive: boolean;
}

export default function ApiKeyManager() {
  const { address } = useMnee();
  const [demoMode] = useState(true);
  
  // Demo API keys for presentation
  const demoKeys: ApiKey[] = [
    {
      id: '1',
      name: 'Production API Key',
      permissions: ['read', 'write', 'payments'],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    },
    {
      id: '2',
      name: 'Test Environment Key',
      permissions: ['read'],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    },
    {
      id: '3',
      name: 'Legacy Integration',
      permissions: ['read', 'write'],
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: false,
    },
  ];

  const [apiKeys, setApiKeys] = useState<ApiKey[]>(demoMode ? demoKeys : []);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (address && !demoMode) {
      fetchApiKeys();
    }
  }, [address, demoMode]);

  async function fetchApiKeys() {
    if (!address) return;
    
    try {
      const response = await fetch(`/api/api-keys?userId=${address}`);
      const data = await response.json();
      setApiKeys(data.apiKeys || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  }

  async function createApiKey() {
    if (!newKeyName.trim()) return;

    setIsLoading(true);
    
    // Demo mode: Generate fake key
    if (demoMode) {
      const fakeKey = 'mnee_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setGeneratedKey(fakeKey);
      
      // Add to demo keys list
      const newKey: ApiKey = {
        id: String(apiKeys.length + 1),
        name: newKeyName,
        permissions: ['read', 'write'],
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      setApiKeys([...apiKeys, newKey]);
      setNewKeyName('');
      setIsLoading(false);
      return;
    }

    // Real mode: Call API
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          userId: address,
          permissions: ['read', 'write'],
        }),
      });

      const data = await response.json();
      setGeneratedKey(data.apiKey);
      setNewKeyName('');
      await fetchApiKeys();
    } catch (error) {
      console.error('Error creating API key:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function revokeApiKey(keyId: string) {
    try {
      await fetch(`/api/api-keys?id=${keyId}`, {
        method: 'DELETE',
      });
      await fetchApiKeys();
    } catch (error) {
      console.error('Error revoking API key:', error);
    }
  }

  if (!address && !demoMode) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground">Connect your wallet to manage API keys</p>
      </div>
    );
  }

  return (
    <div className="glass-card">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold gradient-text">Your API Keys</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage keys for programmatic access
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 glass-button glass-button-primary font-medium hover:scale-105 transition-transform shadow-lg shadow-blue-500/25"
        >
          + Create API Key
        </button>
      </div>

      {/* API Keys List */}
      <div className="p-6">
        {apiKeys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No API keys yet. Create one to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 glass-card-inner rounded-xl hover:bg-white/5 transition-colors"
              >
                <div>
                  <div className="font-medium gradient-text">{key.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Created: {formatDate(key.createdAt)}
                  </div>
                  {key.lastUsedAt && (
                    <div className="text-xs text-muted-foreground">
                      Last used: {formatDate(key.lastUsedAt)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 text-xs rounded-full backdrop-blur-sm ${
                      key.isActive
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border border-gray-500/30'
                    }`}
                  >
                    {key.isActive ? 'Active' : 'Revoked'}
                  </span>
                  {key.isActive && (
                    <button
                      onClick={() => revokeApiKey(key.id)}
                      className="px-3 py-1 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/30"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full mx-4">
            {generatedKey ? (
              <>
                <h3 className="text-lg font-semibold gradient-text mb-4">API Key Created</h3>
                <div className="glass-card-inner p-4 rounded-xl mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Copy this key now. You won't be able to see it again!
                  </p>
                  <code className="block p-3 bg-black/20 rounded-lg border border-white/10 text-sm break-all font-mono text-blue-300">
                    {generatedKey}
                  </code>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedKey);
                    }}
                    className="flex-1 px-4 py-2 glass-button glass-button-primary font-medium hover:scale-105 transition-transform"
                  >
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedKey(null);
                      setShowCreateModal(false);
                    }}
                    className="px-4 py-2 glass-button hover:bg-white/10 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold gradient-text mb-4">Create API Key</h3>
                <input
                  type="text"
                  placeholder="Key name (e.g., Production API)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-4 py-3 glass-input rounded-xl mb-4 bg-background/50 border border-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
                <div className="flex gap-3">
                  <button
                    onClick={createApiKey}
                    disabled={isLoading || !newKeyName.trim()}
                    className="flex-1 px-4 py-2 glass-button glass-button-primary font-medium hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300"
                  >
                    {isLoading ? 'Creating...' : 'Create Key'}
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 glass-button hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

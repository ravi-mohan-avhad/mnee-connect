/**
 * Yield Mode Toggle Component
 * Cosmic glassmorphism design for Aave yield farming controls
 */

'use client';

import { useEffect, useState } from 'react';
import { useMnee } from '@/hooks/useMnee';

interface YieldSettings {
  yieldModeEnabled: boolean;
  autoYieldEnabled: boolean;
  minIdleBalance: string;
  idleDurationHours: number;
}

export default function YieldModeToggle() {
  const { address } = useMnee();
  const [settings, setSettings] = useState<YieldSettings>({
    yieldModeEnabled: false,
    autoYieldEnabled: false,
    minIdleBalance: '100',
    idleDurationHours: 24,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch current settings
  useEffect(() => {
    if (!address) return;

    async function fetchSettings() {
      try {
        const response = await fetch(`/api/yield/toggle?userAddress=${address}`);
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Error fetching yield settings:', error);
      }
    }

    fetchSettings();
  }, [address]);

  // Toggle yield mode
  const handleToggleYieldMode = async () => {
    if (!address) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/yield/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          yieldModeEnabled: !settings.yieldModeEnabled,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSettings(data.settings);
        setMessage({
          type: 'success',
          text: data.settings.yieldModeEnabled
            ? 'Yield mode enabled! Idle MNEE will earn interest on Aave.'
            : 'Yield mode disabled.',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to toggle yield mode' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to toggle yield mode' });
    } finally {
      setLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // Toggle auto-yield
  const handleToggleAutoYield = async () => {
    if (!address) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/yield/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          autoYieldEnabled: !settings.autoYieldEnabled,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSettings(data.settings);
        setMessage({
          type: 'success',
          text: data.settings.autoYieldEnabled
            ? 'Auto-yield enabled! System will automatically deposit idle funds.'
            : 'Auto-yield disabled.',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to toggle auto-yield' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to toggle auto-yield' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // Update settings
  const handleUpdateSettings = async () => {
    if (!address) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/yield/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          minIdleBalance: settings.minIdleBalance,
          idleDurationHours: settings.idleDurationHours,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSettings(data.settings);
        setMessage({ type: 'success', text: 'Settings updated successfully' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update settings' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (!address) {
    return (
      <div className="glass-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white text-lg">🔗</span>
          </div>
          <div>
            <p className="font-medium gradient-text">Connect Wallet</p>
            <p className="text-sm text-muted-foreground">Connect your wallet to manage yield settings</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <span className="text-white text-xl">🌱</span>
          </div>
          <div>
            <h3 className="text-xl font-bold gradient-text">Yield Farming Mode</h3>
            <p className="text-sm text-muted-foreground">Earn interest on idle MNEE via Aave V3</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
            settings.yieldModeEnabled
              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-500/30'
          }`}>
            {settings.yieldModeEnabled ? 'ACTIVE' : 'INACTIVE'}
          </span>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.yieldModeEnabled}
              onChange={handleToggleYieldMode}
              disabled={loading}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-teal-500 shadow-lg"></div>
          </label>
        </div>
      </div>

      {settings.yieldModeEnabled && (
        <div className="space-y-6 border-t border-white/20 dark:border-gray-700/50 pt-6">
          {/* Auto-Yield Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm">⚡</span>
              </div>
              <div>
                <p className="font-medium">Automatic Yield Farming</p>
                <p className="text-sm text-muted-foreground">
                  Automatically deposit idle funds
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoYieldEnabled}
                onChange={handleToggleAutoYield}
                disabled={loading}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500"></div>
              <span className="ml-3 text-sm font-medium">
                {settings.autoYieldEnabled ? 'ON' : 'OFF'}
              </span>
            </label>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium gradient-text">
                Minimum Idle Balance
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.minIdleBalance}
                  onChange={(e) =>
                    setSettings({ ...settings, minIdleBalance: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  min="0"
                  step="10"
                  placeholder="100"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  MNEE
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum balance to consider for yield farming
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium gradient-text">
                Idle Duration
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.idleDurationHours}
                  onChange={(e) =>
                    setSettings({ ...settings, idleDurationHours: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  min="1"
                  max="168"
                  placeholder="24"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  hours
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Hours of inactivity required (1-168)
              </p>
            </div>
          </div>

          <button
            onClick={handleUpdateSettings}
            disabled={loading}
            className="w-full glass-button glass-button-primary font-medium py-3 px-6 rounded-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Updating Settings...
              </div>
            ) : (
              'Update Settings'
            )}
          </button>

          {/* Info Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">ℹ️</span>
              </div>
              <div>
                <p className="text-sm text-foreground font-medium mb-1">How it works</p>
                <p className="text-sm text-muted-foreground">
                  MNEE balances over <span className="font-medium text-foreground">{settings.minIdleBalance} MNEE</span> that haven't moved in{' '}
                  <span className="font-medium text-foreground">{settings.idleDurationHours} hours</span> will be automatically deposited into Aave V3 to earn ~4.5% APY. You can withdraw anytime with zero penalties.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`mt-6 p-4 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            }`}>
              <span className="text-white text-xs">
                {message.type === 'success' ? '✓' : '✕'}
              </span>
            </div>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}

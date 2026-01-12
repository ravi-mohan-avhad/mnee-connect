/**
 * Transaction Table Component
 * Displays transaction history with filtering
 */

'use client';

import { useEffect, useState } from 'react';
import { useMnee } from '@/hooks/useMnee';
import { formatDateTime } from '@/lib/format-date';

interface Transaction {
  id: string;
  transactionHash: string;
  fromAddress: string;
  toAddress: string;
  amountFormatted: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  payerType: 'HUMAN' | 'AI_AGENT';
  timestamp: string;
  blockNumber?: string;
}

export default function TransactionTable() {
  const { address } = useMnee();
  const [demoMode] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [mounted, setMounted] = useState(false);

  // Initialize demo transactions on client side only
  useEffect(() => {
    setMounted(true);
    if (demoMode) {
      const demoTransactions: Transaction[] = [
        {
          id: '1',
          transactionHash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
          fromAddress: '0x1234...5678',
          toAddress: '0xabcd...ef01',
          amountFormatted: '250.00',
          status: 'CONFIRMED',
          payerType: 'AI_AGENT',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          blockNumber: '19234567',
        },
        {
          id: '2',
          transactionHash: '0x8f3cf7ad23Cd3CaDbD9735AFf958023239c6A063',
          fromAddress: '0x9876...4321',
          toAddress: '0xabcd...ef01',
          amountFormatted: '125.50',
          status: 'CONFIRMED',
          payerType: 'HUMAN',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          blockNumber: '19234501',
        },
        {
          id: '3',
          transactionHash: '0xa5c3C28B0Db327D11F08d0b7f4F19E1bE3f5D6A2',
          fromAddress: '0x5555...8888',
          toAddress: '0xabcd...ef01',
          amountFormatted: '500.00',
          status: 'CONFIRMED',
          payerType: 'AI_AGENT',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          blockNumber: '19233201',
        },
        {
          id: '4',
          transactionHash: '0xd629eb935f4F8d3e5e8C5D8c02E9B0E4d7a4C3f1',
          fromAddress: '0xaaaa...bbbb',
          toAddress: '0xabcd...ef01',
          amountFormatted: '75.25',
          status: 'PENDING',
          payerType: 'AI_AGENT',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
        {
          id: '5',
          transactionHash: '0xe7f45bce2A8c9D3e1f4a5b6c7d8e9f0a1b2c3d4e',
          fromAddress: '0xcccc...dddd',
          toAddress: '0xabcd...ef01',
          amountFormatted: '1000.00',
          status: 'CONFIRMED',
          payerType: 'AI_AGENT',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          blockNumber: '19231890',
        },
      ];
      setTransactions(demoTransactions);
    }
  }, [demoMode]);

  useEffect(() => {
    if (!address || demoMode || !mounted) return;

    async function fetchTransactions() {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/webhooks/payment?address=${address}&limit=50`
        );
        const data = await response.json();
        setTransactions(data.transactions || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, [address, demoMode]);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'sent') return tx.fromAddress.toLowerCase().includes('abcd'); // Mock: user's address
    if (filter === 'received') return tx.toAddress.toLowerCase().includes('abcd'); // Mock: user's address
    return true;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      CONFIRMED: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30',
      PENDING: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/30',
      FAILED: 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border border-red-500/30',
    };
    return styles[status as keyof typeof styles] || styles.PENDING;
  };

  const getPayerTypeBadge = (payerType: string) => {
    return payerType === 'AI_AGENT'
      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30'
      : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30';
  };

  const shortenHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  if (!address && !demoMode) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground">Connect your wallet to view transactions</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Filter Tabs */}
      <div className="border-b border-white/10 px-6 py-3 flex gap-4">
        {['all', 'sent', 'received'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
              filter === f
                ? 'glass-button glass-button-primary shadow-lg shadow-blue-500/25'
                : 'glass-button hover:bg-white/10'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Payer Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  Loading transactions...
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={`https://etherscan.io/tx/${tx.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors font-mono text-sm underline"
                    >
                      {shortenHash(tx.transactionHash)}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium gradient-text">
                    {tx.amountFormatted} MNEE
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${getStatusBadge(
                        tx.status
                      )}`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${getPayerTypeBadge(
                        tx.payerType
                      )}`}
                    >
                      {tx.payerType === 'AI_AGENT' ? '◆ AI Agent' : '◇ Human'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {formatDateTime(tx.timestamp)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

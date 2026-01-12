/**
 * MNEE Payment Widget
 * Reusable payment component with gasless option
 */

'use client';

import { useState } from 'react';
import { useMnee } from '@/hooks/useMnee';
import { Address } from 'viem';
import { ConnectKitButton } from 'connectkit';

interface PaymentWidgetProps {
  /** Recipient address */
  recipientAddress: Address;
  /** Amount in MNEE (optional - can be set by user) */
  amount?: string;
  /** Description of the payment */
  description?: string;
  /** Enable gasless payments via paymaster */
  enableGasless?: boolean;
  /** Callback when payment succeeds */
  onSuccess?: (txHash: string) => void;
  /** Callback when payment fails */
  onError?: (error: Error) => void;
}

/**
 * PaymentWidget Component
 * 
 * @example
 * ```tsx
 * <PaymentWidget
 *   recipientAddress="0x..."
 *   amount="50.00"
 *   description="Premium Subscription"
 *   enableGasless={true}
 *   onSuccess={(hash) => console.log('Payment successful:', hash)}
 * />
 * ```
 */
export default function PaymentWidget({
  recipientAddress,
  amount: fixedAmount,
  description,
  enableGasless = false,
  onSuccess,
  onError,
}: PaymentWidgetProps) {
  const { address, isConnected, balance, sendPayment, isLoading } = useMnee();
  const [amount, setAmount] = useState(fixedAmount || '');
  const [useGasless, setUseGasless] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handlePayment() {
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance || '0')) {
      setErrorMessage('Insufficient balance');
      return;
    }

    setStatus('processing');
    setErrorMessage(null);

    try {
      // If gasless is enabled, use paymaster (placeholder for now)
      if (useGasless && enableGasless) {
        // TODO: Integrate with Alchemy Gas Manager or similar
        // For now, proceed with regular payment
        console.warn('Gasless payments not yet implemented');
      }

      const hash = await sendPayment(recipientAddress, amount);
      setTxHash(hash);
      setStatus('success');

      // Log to webhook
      await fetch('/api/webhooks/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionHash: hash,
          fromAddress: address,
          toAddress: recipientAddress,
          amount: (parseFloat(amount) * 1_000_000).toString(), // Convert to wei (6 decimals)
          payerType: 'HUMAN',
          metadata: { description },
        }),
      });

      onSuccess?.(hash);
    } catch (error) {
      const err = error as Error;
      setErrorMessage(err.message);
      setStatus('error');
      onError?.(err);
    }
  }

  return (
    <div className="glass-card p-8 max-w-md w-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold gradient-text">MNEE Payment</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {/* Connection Status */}
      {!isConnected ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Connect your wallet to continue</p>
          <ConnectKitButton />
        </div>
      ) : status === 'success' ? (
        /* Success State */
        <div className="text-center py-8">
          <div className="text-6xl mb-4">✅</div>
          <h4 className="text-lg font-semibold gradient-text mb-2">Payment Successful!</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Your payment has been confirmed
          </p>
          {txHash && (
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-blue-400 transition-colors text-sm underline"
            >
              View on Etherscan →
            </a>
          )}
          <button
            onClick={() => {
              setStatus('idle');
              setTxHash(null);
              if (!fixedAmount) setAmount('');
            }}
            className="mt-4 px-4 py-2 glass-button w-full hover:scale-105 transition-transform"
          >
            Make Another Payment
          </button>
        </div>
      ) : (
        /* Payment Form */
        <>
          {/* Balance Display */}
          <div className="mb-4 p-4 glass-card-inner rounded-xl">
            <div className="text-xs text-muted-foreground mb-1">Your Balance</div>
            <div className="text-lg font-semibold gradient-text">{balance || '0'} MNEE</div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 gradient-text">Amount (MNEE)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!!fixedAmount || status === 'processing'}
              placeholder="0.00"
              className="w-full px-4 py-3 glass-input rounded-xl bg-background/50 border border-white/10 backdrop-blur-sm disabled:opacity-50 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>

          {/* Recipient Display */}
          <div className="mb-4 p-4 glass-card-inner rounded-xl">
            <div className="text-xs text-muted-foreground mb-1">Recipient</div>
            <div className="text-sm font-mono break-all text-muted-foreground">{recipientAddress}</div>
          </div>

          {/* Gasless Option */}
          {enableGasless && (
            <div className="mb-4 flex items-center gap-3 p-4 glass-card-inner rounded-xl hover:bg-white/5 transition-colors">
              <input
                type="checkbox"
                id="gasless"
                checked={useGasless}
                onChange={(e) => setUseGasless(e.target.checked)}
                disabled={status === 'processing'}
                className="w-4 h-4 accent-blue-500"
              />
              <label htmlFor="gasless" className="text-sm flex-1 cursor-pointer">
                <span className="font-medium gradient-text">Gasless Payment</span>
                <span className="text-muted-foreground block text-xs">
                  Pay no gas fees (sponsored by MNEE)
                </span>
              </label>
              <span className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
                Beta
              </span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl backdrop-blur-sm text-sm">
              {errorMessage}
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={status === 'processing' || !amount || isLoading}
            className="w-full px-6 py-4 glass-button glass-button-primary font-semibold hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 shadow-lg shadow-blue-500/25"
          >
            {status === 'processing'
              ? 'Processing...'
              : `Pay ${amount || '0'} MNEE`}
          </button>

          {/* Footer */}
          <div className="mt-4 text-center text-xs text-muted-foreground">
            Powered by MNEE Connect
          </div>
        </>
      )}
    </div>
  );
}

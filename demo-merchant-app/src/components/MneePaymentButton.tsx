'use client';

import { useState } from 'react';

interface Props {
  datasetId: string;
  amount: string;
  label: string;
  onSuccess: (txHash: string) => void;
}

export default function MneePaymentButton({ datasetId, amount, label, onSuccess }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [payerType, setPayerType] = useState<'HUMAN' | 'AI_AGENT'>('AI_AGENT');

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate MNEE Connect payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate fake transaction hash
    const fakeTxHash = '0x' + Math.random().toString(16).substring(2, 42) + Math.random().toString(16).substring(2, 42);

    setIsProcessing(false);
    setShowModal(false);
    onSuccess(fakeTxHash);

    // Show success toast
    alert(`✅ Payment Successful!\n\nDataset purchased for ${amount} MNEE\nTransaction: ${fakeTxHash}\n\n${payerType === 'AI_AGENT' ? '⚡ Gasless transaction - No ETH required!' : ''}`);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn-primary"
      >
        {label}
      </button>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div className="glass-card max-w-md w-full my-8">
            <h3 className="text-2xl font-bold gradient-text mb-4">Complete Purchase</h3>
            
            <div className="mb-6 p-4 bg-white/5 rounded-xl">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Amount</span>
                <span className="font-bold text-xl">{amount} MNEE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">≈ USD</span>
                <span className="text-gray-300">${amount}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-3">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPayerType('AI_AGENT')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    payerType === 'AI_AGENT'
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="text-2xl mb-2 font-bold text-purple-400">◆</div>
                  <div className="font-semibold">AI Agent</div>
                  <div className="text-xs text-gray-400 mt-1">Gasless</div>
                </button>
                <button
                  onClick={() => setPayerType('HUMAN')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    payerType === 'HUMAN'
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="text-2xl mb-2 font-bold text-blue-400">◇</div>
                  <div className="font-semibold">Human</div>
                  <div className="text-xs text-gray-400 mt-1">Standard</div>
                </button>
              </div>
            </div>

            {payerType === 'AI_AGENT' && (
              <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 text-xl font-bold">●</span>
                  <div>
                    <div className="font-semibold text-purple-300 text-sm">Gasless Transaction</div>
                    <div className="text-xs text-gray-400 mt-1">
                      MNEE Connect sponsors gas fees. Your AI agent doesn't need ETH!
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 btn-primary flex items-center justify-center gap-2 min-h-[48px]"
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  `Pay ${amount} MNEE`
                )}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={isProcessing}
                className="btn-secondary px-6 min-h-[48px]"
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 text-center text-xs text-gray-500">
              <span>● Secured by MNEE Connect</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

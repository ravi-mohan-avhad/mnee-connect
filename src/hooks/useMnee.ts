/**
 * useMnee Hook
 * Custom React hook that wraps Wagmi for MNEE-specific operations
 */

'use client';

import { useAccount, usePublicClient, useWalletClient, useReadContract, useWriteContract } from 'wagmi';
import { useState, useCallback, useMemo } from 'react';
import { Address, Hash, parseUnits, formatUnits } from 'viem';
import { MNEE_TOKEN_CONFIG, MNEE_TOKEN_ABI } from '@mnee-connect/sdk';

interface UseMneeReturn {
  // Account info
  address?: Address;
  isConnected: boolean;
  
  // Balance
  balance?: string;
  balanceWei?: bigint;
  isLoadingBalance: boolean;
  refetchBalance: () => void;
  
  // Operations
  sendPayment: (to: Address, amount: string) => Promise<Hash>;
  approveSpender: (spender: Address, amount: string) => Promise<Hash>;
  getAllowance: (owner: Address, spender: Address) => Promise<string>;
  
  // Status
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook for MNEE token operations
 * 
 * @example
 * ```typescript
 * function PaymentComponent() {
 *   const { balance, sendPayment, isConnected } = useMnee();
 * 
 *   const handlePay = async () => {
 *     const hash = await sendPayment('0xRecipient', '100.50');
 *     console.log('Payment sent:', hash);
 *   };
 * 
 *   return (
 *     <div>
 *       <p>Balance: {balance} MNEE</p>
 *       <button onClick={handlePay} disabled={!isConnected}>
 *         Send Payment
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useMnee(): UseMneeReturn {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Read balance
  const {
    data: balanceWei,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useReadContract({
    address: MNEE_TOKEN_CONFIG.address,
    abi: MNEE_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Format balance for display
  const balance = useMemo(() => {
    if (!balanceWei) return '0';
    return formatUnits(balanceWei as bigint, MNEE_TOKEN_CONFIG.decimals);
  }, [balanceWei]);

  /**
   * Send MNEE payment
   */
  const sendPayment = useCallback(
    async (to: Address, amount: string): Promise<Hash> => {
      if (!walletClient || !address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const amountWei = parseUnits(amount, MNEE_TOKEN_CONFIG.decimals);

        const hash = await writeContractAsync({
          address: MNEE_TOKEN_CONFIG.address,
          abi: MNEE_TOKEN_ABI,
          functionName: 'transfer',
          args: [to, amountWei],
        });

        // Refetch balance after successful payment
        setTimeout(() => refetchBalance(), 2000);

        return hash;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [walletClient, address, writeContractAsync, refetchBalance]
  );

  /**
   * Approve spender to use tokens
   */
  const approveSpender = useCallback(
    async (spender: Address, amount: string): Promise<Hash> => {
      if (!walletClient || !address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const amountWei = parseUnits(amount, MNEE_TOKEN_CONFIG.decimals);

        const hash = await writeContractAsync({
          address: MNEE_TOKEN_CONFIG.address,
          abi: MNEE_TOKEN_ABI,
          functionName: 'approve',
          args: [spender, amountWei],
        });

        return hash;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [walletClient, address, writeContractAsync]
  );

  /**
   * Get allowance for a spender
   */
  const getAllowance = useCallback(
    async (owner: Address, spender: Address): Promise<string> => {
      if (!publicClient) {
        throw new Error('Public client not initialized');
      }

      try {
        const allowanceWei = await publicClient.readContract({
          address: MNEE_TOKEN_CONFIG.address,
          abi: MNEE_TOKEN_ABI,
          functionName: 'allowance',
          args: [owner, spender],
        });

        return formatUnits(allowanceWei as bigint, MNEE_TOKEN_CONFIG.decimals);
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      }
    },
    [publicClient]
  );

  return {
    // Account
    address,
    isConnected,
    
    // Balance
    balance,
    balanceWei: balanceWei as bigint | undefined,
    isLoadingBalance,
    refetchBalance,
    
    // Operations
    sendPayment,
    approveSpender,
    getAllowance,
    
    // Status
    isLoading,
    error,
  };
}

/**
 * Hook for MNEE token info
 */
export function useMneeInfo() {
  return {
    address: MNEE_TOKEN_CONFIG.address,
    decimals: MNEE_TOKEN_CONFIG.decimals,
    symbol: MNEE_TOKEN_CONFIG.symbol,
    name: MNEE_TOKEN_CONFIG.name,
  };
}

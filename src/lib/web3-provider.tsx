/**
 * Web3 Provider Configuration
 * Configures Wagmi, ConnectKit, and React Query for MNEE Connect
 */

'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { injected, coinbaseWallet } from 'wagmi/connectors';
import { ReactNode, useEffect } from 'react';

// Create Wagmi config with connectors (WalletConnect removed for demo stability)
const config = createConfig({
  chains: [mainnet],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'MNEE Connect',
    }),
  ],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://eth.llamarpc.com'),
  },
  ssr: true,
});

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

interface Web3ProviderProps {
  children: ReactNode;
}

/**
 * Web3Provider component
 * Wraps app with necessary providers for Web3 functionality
 */
export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider mode="auto">
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { config };

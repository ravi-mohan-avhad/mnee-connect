import type { Metadata } from 'next';
import './globals.css';
import { Web3Provider } from '@/lib/web3-provider';

export const metadata: Metadata = {
  title: 'MNEE Connect - Agent Commerce Infrastructure',
  description: 'Gasless MNEE payments, escrow protection, and yield farming for AI agents',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="relative min-h-screen">
        {/* Cosmic Background Particles */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="cosmic-orb"></div>
          <div className="cosmic-orb"></div>
          <div className="cosmic-orb"></div>
          <div className="cosmic-orb"></div>
        </div>

        <Web3Provider>
          <div className="relative z-10">
            {children}
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}

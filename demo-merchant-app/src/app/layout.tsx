import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Data Marketplace - Powered by MNEE Connect',
  description: 'Purchase premium datasets with MNEE - Gasless payments for AI agents',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}

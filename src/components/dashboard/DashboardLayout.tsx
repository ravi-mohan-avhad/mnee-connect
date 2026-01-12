/**
 * Dashboard Layout Component
 * Cosmic-themed glassmorphism design with sidebar navigation
 */

'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectKitButton } from 'connectkit';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  description?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: '◉',
    description: 'Overview & Analytics'
  },
  {
    label: 'Transactions',
    href: '/dashboard/transactions',
    icon: '◉',
    description: 'Payment History'
  },
  {
    label: 'API Keys',
    href: '/dashboard/api-keys',
    icon: '◈',
    description: 'Developer Access'
  },
  {
    label: 'Session Keys',
    href: '/dashboard/session-keys',
    icon: '◆',
    description: 'Agent Authorization'
  },
  {
    label: 'Webhooks',
    href: '/dashboard/webhooks',
    icon: '🔔',
    description: 'Event Notifications'
  },
  {
    label: 'Documentation',
    href: '/docs',
    icon: '📚',
    description: 'API Reference'
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      } sidebar-glass`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <img 
                src="/mnee-logo.png" 
                alt="MNEE Logo" 
                className="w-8 h-8 object-contain"
              />
              {!isSidebarCollapsed && (
                <div>
                  <h1 className="text-xl font-bold gradient-text">
                    MNEE Connect
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">Agent Commerce</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-gray-800/50 hover:text-foreground hover:translate-x-1'
                  }`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  {!isSidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.label}</div>
                      <div className="text-xs opacity-70 truncate">{item.description}</div>
                    </div>
                  )}
                  {isActive && !isSidebarCollapsed && (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/50 dark:border-gray-700/50">
            {!isSidebarCollapsed && (
              <div className="text-xs text-muted-foreground mb-3">Connected Wallet</div>
            )}
            <div className="flex items-center gap-2">
              <ConnectKitButton />
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isSidebarCollapsed ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 topbar-glass backdrop-blur-xl">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold gradient-text">
                {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
              </h2>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <span>MNEE Connect</span>
                <span>•</span>
                <span>Agent Commerce Infrastructure</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                className="p-2 rounded-lg glass-button hover:scale-105 transition-transform"
                title="Toggle Theme"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </button>

              {/* Network Status */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Sepolia Testnet
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

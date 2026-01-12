/**
 * Utility functions for MNEE SDK
 */

import { MNEE_TOKEN_CONFIG } from './constants';

/**
 * Convert MNEE amount to wei (smallest unit)
 * @param amount - Human readable MNEE amount (e.g., "100.50")
 * @returns Amount in wei
 * 
 * @example
 * ```typescript
 * const weiAmount = toWei("100.5"); // Returns 100500000n (6 decimals)
 * ```
 */
export function toWei(amount: string | number): bigint {
  const amountStr = typeof amount === 'number' ? amount.toString() : amount;
  const [whole, decimal = ''] = amountStr.split('.');
  
  const paddedDecimal = decimal.padEnd(MNEE_TOKEN_CONFIG.decimals, '0');
  const truncatedDecimal = paddedDecimal.slice(0, MNEE_TOKEN_CONFIG.decimals);
  
  const weiAmount = BigInt(whole + truncatedDecimal);
  return weiAmount;
}

/**
 * Convert wei to human readable MNEE amount
 * @param wei - Amount in wei
 * @returns Human readable amount
 * 
 * @example
 * ```typescript
 * const readable = fromWei(100500000n); // Returns "100.50"
 * ```
 */
export function fromWei(wei: bigint): string {
  const weiStr = wei.toString().padStart(MNEE_TOKEN_CONFIG.decimals + 1, '0');
  const decimalPosition = weiStr.length - MNEE_TOKEN_CONFIG.decimals;
  
  const whole = weiStr.slice(0, decimalPosition) || '0';
  const decimal = weiStr.slice(decimalPosition);
  
  // Remove trailing zeros
  const trimmedDecimal = decimal.replace(/0+$/, '');
  
  return trimmedDecimal ? `${whole}.${trimmedDecimal}` : whole;
}

/**
 * Format MNEE amount with symbol
 * @param amount - Amount in wei or string
 * @returns Formatted string with MNEE symbol
 * 
 * @example
 * ```typescript
 * const formatted = formatMnee(100500000n); // Returns "100.50 MNEE"
 * ```
 */
export function formatMnee(amount: bigint | string): string {
  const readable = typeof amount === 'bigint' ? fromWei(amount) : amount;
  return `${readable} ${MNEE_TOKEN_CONFIG.symbol}`;
}

/**
 * Validate Ethereum address
 * @param address - Address to validate
 * @returns True if valid Ethereum address
 */
export function isValidAddress(address: string): address is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Shorten address for display
 * @param address - Full Ethereum address
 * @param chars - Number of chars to show on each side
 * @returns Shortened address (e.g., "0x1234...5678")
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Generate a random session key expiration timestamp
 * @param durationInSeconds - Duration in seconds
 * @returns Unix timestamp
 */
export function getExpirationTimestamp(durationInSeconds: number): number {
  return Math.floor(Date.now() / 1000) + durationInSeconds;
}

/**
 * Check if session key is expired
 * @param expiresAt - Expiration timestamp
 * @returns True if expired
 */
export function isExpired(expiresAt: number): boolean {
  return Math.floor(Date.now() / 1000) >= expiresAt;
}

/**
 * @mnee-connect/sdk
 * Main entry point for MNEE Connect SDK
 */

// Export main client
export { MneeClient } from './MneeClient';
export type {
  MneeClientConfig,
  AuthorizeAgentOptions,
  PaymentOptions,
} from './MneeClient';

// Export constants and types
export {
  MNEE_TOKEN_CONFIG,
  MNEE_TOKEN_ABI,
  PaymentStatus,
} from './constants';
export type {
  SessionKey,
  TransactionReceipt,
} from './constants';

// Export utilities
export {
  toWei,
  fromWei,
  formatMnee,
  isValidAddress,
  shortenAddress,
  getExpirationTimestamp,
  isExpired,
} from './utils';

// Version
export const VERSION = '1.0.0';

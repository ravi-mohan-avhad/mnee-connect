/**
 * @mnee-connect/sdk
 * 
 * MneeClient - Core SDK class for MNEE Stablecoin payments
 * Provides session key management, payment operations, and agent authorization
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type WalletClient,
  type Address,
  type Hash,
  type Account,
  parseEther,
  formatEther,
  encodeAbiParameters,
  keccak256,
  parseAbiParameters,
} from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';
import {
  MNEE_TOKEN_CONFIG,
  MNEE_TOKEN_ABI,
  SessionKey,
  TransactionReceipt,
  PaymentStatus,
} from './constants';
import {
  toWei,
  fromWei,
  formatMnee,
  getExpirationTimestamp,
  isExpired,
  isValidAddress,
} from './utils';

/**
 * MneeClient Configuration Options
 */
export interface MneeClientConfig {
  /** RPC URL for Ethereum node */
  rpcUrl: string;
  /** Chain ID (default: 1 for Ethereum mainnet) */
  chainId?: number;
  /** Optional wallet account for signing transactions */
  account?: Account;
  /** Optional custom MNEE token address (for testing) */
  tokenAddress?: Address;
}

/**
 * Session Key Authorization Options
 */
export interface AuthorizeAgentOptions {
  /** Maximum amount the agent can spend (in MNEE) */
  spendLimit: string | number;
  /** Duration in seconds (e.g., 3600 for 1 hour) */
  duration: number;
  /** Optional label for the session key */
  label?: string;
}

/**
 * Payment Options
 */
export interface PaymentOptions {
  /** Recipient address */
  to: Address;
  /** Amount in MNEE */
  amount: string | number;
  /** Optional session key for agent payments */
  sessionKey?: SessionKey;
  /** Optional gas limit */
  gasLimit?: bigint;
}

/**
 * MneeClient - Main SDK class for interacting with MNEE token
 * 
 * @example
 * ```typescript
 * const client = new MneeClient({
 *   rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
 *   account: privateKeyToAccount('0x...')
 * });
 * 
 * // Authorize an AI agent
 * const sessionKey = await client.authorizeAgent({
 *   spendLimit: '1000',
 *   duration: 3600
 * });
 * 
 * // Send payment
 * const receipt = await client.sendPayment({
 *   to: '0x...',
 *   amount: '100.50'
 * });
 * ```
 */
export class MneeClient {
  private publicClient: PublicClient;
  private walletClient?: WalletClient;
  private account?: Account;
  private tokenAddress: Address;
  private sessionKeys: Map<string, SessionKey> = new Map();

  constructor(config: MneeClientConfig) {
    // Initialize public client for reading blockchain data
    this.publicClient = createPublicClient({
      chain: config.chainId === 1 ? mainnet : mainnet,
      transport: http(config.rpcUrl),
    });

    // Initialize wallet client if account provided
    if (config.account) {
      this.account = config.account;
      this.walletClient = createWalletClient({
        account: config.account,
        chain: config.chainId === 1 ? mainnet : mainnet,
        transport: http(config.rpcUrl),
      });
    }

    this.tokenAddress = config.tokenAddress || MNEE_TOKEN_CONFIG.address;
  }

  /**
   * Get MNEE balance for an address
   * 
   * @param address - Ethereum address to check balance
   * @returns Balance in human-readable format
   * 
   * @example
   * ```typescript
   * const balance = await client.getBalance('0x...');
   * console.log(balance); // "1500.00"
   * ```
   */
  async getBalance(address: Address): Promise<string> {
    if (!isValidAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }

    const balance = await this.publicClient.readContract({
      address: this.tokenAddress,
      abi: MNEE_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [address],
    });

    return fromWei(balance as bigint);
  }

  /**
   * Get allowance (approved spending limit) for a spender
   * 
   * @param owner - Token owner address
   * @param spender - Spender address
   * @returns Allowance in human-readable format
   */
  async getAllowance(owner: Address, spender: Address): Promise<string> {
    const allowance = await this.publicClient.readContract({
      address: this.tokenAddress,
      abi: MNEE_TOKEN_ABI,
      functionName: 'allowance',
      args: [owner, spender],
    });

    return fromWei(allowance as bigint);
  }

  /**
   * Approve a spender to use tokens on behalf of the owner
   * 
   * @param spender - Address to approve
   * @param amount - Amount to approve (in MNEE)
   * @returns Transaction hash
   */
  async approve(spender: Address, amount: string | number): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error('Wallet client not initialized. Provide account in constructor.');
    }

    const amountWei = toWei(amount);

    const hash = await this.walletClient.writeContract({
      address: this.tokenAddress,
      abi: MNEE_TOKEN_ABI,
      functionName: 'approve',
      args: [spender, amountWei],
    });

    return hash;
  }

  /**
   * Authorize an AI agent with a session key
   * Creates an ephemeral signer that can spend up to a limit without manual approval
   * 
   * @param options - Authorization options
   * @returns Session key object
   * 
   * @example
   * ```typescript
   * const sessionKey = await client.authorizeAgent({
   *   spendLimit: '1000', // 1000 MNEE
   *   duration: 3600,     // 1 hour
   *   label: 'AI Assistant'
   * });
   * 
   * // Store session key securely for agent use
   * localStorage.setItem('agentKey', JSON.stringify(sessionKey));
   * ```
   */
  async authorizeAgent(options: AuthorizeAgentOptions): Promise<SessionKey> {
    if (!this.account) {
      throw new Error('Account not initialized. Provide account in constructor.');
    }

    // Generate ephemeral private key for session
    const privateKey = generatePrivateKey();
    const sessionAccount = privateKeyToAccount(privateKey);

    const spendLimitWei = toWei(options.spendLimit);
    const expiresAt = getExpirationTimestamp(options.duration);

    const sessionKey: SessionKey = {
      privateKey,
      address: sessionAccount.address,
      spendLimit: spendLimitWei,
      remainingLimit: spendLimitWei,
      expiresAt,
      createdAt: Math.floor(Date.now() / 1000),
    };

    // Store session key in memory (in production, store securely)
    const keyId = options.label || sessionAccount.address;
    this.sessionKeys.set(keyId, sessionKey);

    // Approve session key to spend on behalf of main account
    await this.approve(sessionAccount.address, options.spendLimit);

    return sessionKey;
  }

  /**
   * Get a stored session key by ID or address
   * 
   * @param keyId - Session key ID or address
   * @returns Session key if found
   */
  getSessionKey(keyId: string): SessionKey | undefined {
    return this.sessionKeys.get(keyId);
  }

  /**
   * Revoke a session key
   * 
   * @param keyId - Session key ID to revoke
   * @returns Transaction hash
   */
  async revokeSessionKey(keyId: string): Promise<Hash> {
    const sessionKey = this.sessionKeys.get(keyId);
    if (!sessionKey) {
      throw new Error('Session key not found');
    }

    // Set allowance to zero to revoke
    const hash = await this.approve(sessionKey.address, '0');
    
    // Remove from memory
    this.sessionKeys.delete(keyId);

    return hash;
  }

  /**
   * Send MNEE payment
   * 
   * @param options - Payment options
   * @returns Transaction receipt
   * 
   * @example
   * ```typescript
   * // Regular payment
   * const receipt = await client.sendPayment({
   *   to: '0xRecipientAddress',
   *   amount: '50.25'
   * });
   * 
   * // Agent payment using session key
   * const receipt = await client.sendPayment({
   *   to: '0xRecipientAddress',
   *   amount: '50.25',
   *   sessionKey: storedSessionKey
   * });
   * ```
   */
  async sendPayment(options: PaymentOptions): Promise<TransactionReceipt> {
    const { to, amount, sessionKey } = options;

    if (!isValidAddress(to)) {
      throw new Error('Invalid recipient address');
    }

    const amountWei = toWei(amount);

    // Check if using session key
    if (sessionKey) {
      return this._sendPaymentWithSessionKey(to, amountWei, sessionKey);
    }

    // Regular payment with main account
    if (!this.walletClient || !this.account) {
      throw new Error('Wallet client not initialized');
    }

    const hash = await this.walletClient.writeContract({
      address: this.tokenAddress,
      abi: MNEE_TOKEN_ABI,
      functionName: 'transfer',
      args: [to, amountWei],
    });

    // Wait for transaction confirmation
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash,
    });

    return {
      hash,
      from: this.account.address,
      to,
      amount: amountWei,
      status: receipt.status === 'success' ? PaymentStatus.CONFIRMED : PaymentStatus.FAILED,
      timestamp: Math.floor(Date.now() / 1000),
      blockNumber: receipt.blockNumber,
    };
  }

  /**
   * Send payment using session key (internal method)
   * @private
   */
  private async _sendPaymentWithSessionKey(
    to: Address,
    amount: bigint,
    sessionKey: SessionKey
  ): Promise<TransactionReceipt> {
    // Validate session key
    if (isExpired(sessionKey.expiresAt)) {
      throw new Error('Session key has expired');
    }

    if (amount > sessionKey.remainingLimit) {
      throw new Error(
        `Amount exceeds session key limit. Remaining: ${fromWei(sessionKey.remainingLimit)} MNEE`
      );
    }

    if (!this.account) {
      throw new Error('Main account not initialized');
    }

    // Create wallet client with session key
    const sessionAccount = privateKeyToAccount(sessionKey.privateKey);
    const sessionWalletClient = createWalletClient({
      account: sessionAccount,
      chain: mainnet,
      transport: http(this.publicClient.transport.url as string),
    });

    // Use transferFrom to spend from main account
    const hash = await sessionWalletClient.writeContract({
      address: this.tokenAddress,
      abi: MNEE_TOKEN_ABI,
      functionName: 'transferFrom',
      args: [this.account.address, to, amount],
    });

    // Update remaining limit
    sessionKey.remainingLimit -= amount;

    // Wait for confirmation
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash,
    });

    return {
      hash,
      from: this.account.address,
      to,
      amount,
      status: receipt.status === 'success' ? PaymentStatus.CONFIRMED : PaymentStatus.FAILED,
      timestamp: Math.floor(Date.now() / 1000),
      blockNumber: receipt.blockNumber,
    };
  }

  /**
   * Stream payment (simulated for now - could integrate with Superfluid or similar)
   * 
   * @param options - Payment options with rate
   * @returns Stream ID
   */
  async streamPayment(
    to: Address,
    ratePerSecond: string | number,
    duration: number
  ): Promise<string> {
    // Placeholder for streaming payment functionality
    // In production, integrate with Superfluid or similar protocol
    throw new Error('Stream payment not yet implemented. Coming soon with Superfluid integration.');
  }

  /**
   * Get transaction status
   * 
   * @param hash - Transaction hash
   * @returns Transaction receipt
   */
  async getTransactionStatus(hash: Hash): Promise<TransactionReceipt | null> {
    try {
      const receipt = await this.publicClient.getTransactionReceipt({ hash });
      const transaction = await this.publicClient.getTransaction({ hash });

      return {
        hash,
        from: transaction.from,
        to: transaction.to as Address,
        amount: 0n, // Would need to parse logs for exact amount
        status: receipt.status === 'success' ? PaymentStatus.CONFIRMED : PaymentStatus.FAILED,
        timestamp: Math.floor(Date.now() / 1000),
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Estimate gas for a payment
   * 
   * @param to - Recipient address
   * @param amount - Amount in MNEE
   * @returns Estimated gas in wei
   */
  async estimateGas(to: Address, amount: string | number): Promise<bigint> {
    if (!this.account) {
      throw new Error('Account not initialized');
    }

    const amountWei = toWei(amount);

    const gas = await this.publicClient.estimateContractGas({
      address: this.tokenAddress,
      abi: MNEE_TOKEN_ABI,
      functionName: 'transfer',
      args: [to, amountWei],
      account: this.account,
    });

    return gas;
  }

  /**
   * Send a gasless MNEE payment using ERC-4337 (Account Abstraction)
   * 
   * Requires AccountAbstractionService integration
   * 
   * @param options - Gasless payment options
   * @returns Transaction details and gas cost
   * 
   * @example
   * ```typescript
   * const result = await client.sendGaslessPayment({
   *   to: '0x...',
   *   amount: '50.25',
   *   sessionKey: sessionKey,
   *   maxGasCostInMnee: '5'
   * });
   * ```
   */
  async sendGaslessPayment(options: {
    to: Address;
    amount: string | number;
    sessionKey?: SessionKey;
    maxGasCostInMnee?: string;
  }): Promise<{
    success: boolean;
    userOpHash?: string;
    txHash?: string;
    gasCostInMnee: string;
    error?: string;
  }> {
    // This method requires AccountAbstractionService
    // Call the backend API endpoint instead
    try {
      const response = await fetch('/api/paymaster/sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentAddress: this.account?.address,
          recipientAddress: options.to,
          amount: String(options.amount),
          sessionKeyId: options.sessionKey?.address,
          maxGasCostInMnee: options.maxGasCostInMnee,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          gasCostInMnee: '0',
          error: data.error || 'Unknown error',
        };
      }

      return {
        success: true,
        userOpHash: data.userOpHash,
        gasCostInMnee: data.gasCostInMnee || '0',
      };
    } catch (error) {
      return {
        success: false,
        gasCostInMnee: '0',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create an escrow task with locked MNEE funds
   * 
   * @param options - Escrow creation options
   * @returns Escrow task details
   * 
   * @example
   * ```typescript
   * const escrow = await client.createEscrow({
   *   providerAddress: '0x...',
   *   amount: '500',
   *   taskDescription: 'Build landing page',
   *   deadlineHours: 72,
   *   autoRefund: true
   * });
   * ```
   */
  async createEscrow(options: {
    providerAddress: Address;
    amount: string | number;
    taskDescription: string;
    deadlineHours: number;
    autoRefund?: boolean;
    contractAddress?: Address;
  }): Promise<{
    success: boolean;
    taskId?: string;
    escrow?: any;
    error?: string;
  }> {
    try {
      if (!this.account) {
        throw new Error('Account not initialized');
      }

      // Generate unique taskId
      const taskId = keccak256(
        encodeAbiParameters(
          parseAbiParameters('address, address, uint256, uint256, string'),
          [
            this.account.address,
            options.providerAddress,
            toWei(options.amount),
            BigInt(Math.floor(Date.now() / 1000)),
            options.taskDescription,
          ]
        )
      );

      const deadline = new Date();
      deadline.setHours(deadline.getHours() + options.deadlineHours);

      // Call backend API
      const response = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          agentAddress: this.account.address,
          providerAddress: options.providerAddress,
          amount: toWei(options.amount).toString(),
          amountFormatted: String(options.amount),
          taskDescription: options.taskDescription,
          deadline: deadline.toISOString(),
          autoRefund: options.autoRefund ?? true,
          contractAddress: options.contractAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Unknown error',
        };
      }

      return {
        success: true,
        taskId,
        escrow: data.escrow,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Release escrow funds to service provider with task completion proof
   * 
   * @param taskId - Escrow task identifier
   * @param attestationUID - EAS attestation UID or webhook signature
   * @returns Release result
   * 
   * @example
   * ```typescript
   * const result = await client.releaseEscrow({
   *   taskId: '0x...',
   *   attestationUID: '0x...'
   * });
   * ```
   */
  async releaseEscrow(options: {
    taskId: string;
    attestationUID: string;
    signature?: string;
  }): Promise<{
    success: boolean;
    escrow?: any;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/escrow/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: options.taskId,
          attestationUID: options.attestationUID,
          signature: options.signature,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Unknown error',
        };
      }

      return {
        success: true,
        escrow: data.escrow,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Refund escrow funds to agent (after deadline)
   * 
   * @param taskId - Escrow task identifier
   * @returns Refund result
   */
  async refundEscrow(taskId: string): Promise<{
    success: boolean;
    escrow?: any;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/escrow/release', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Unknown error',
        };
      }

      return {
        success: true,
        escrow: data.escrow,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Enable or disable yield farming mode
   * 
   * @param enabled - Whether to enable yield mode
   * @param options - Additional yield settings
   * @returns Updated settings
   * 
   * @example
   * ```typescript
   * const settings = await client.enableYield(true, {
   *   minIdleBalance: '100',
   *   idleDurationHours: 24
   * });
   * ```
   */
  async enableYield(
    enabled: boolean,
    options?: {
      minIdleBalance?: string;
      idleDurationHours?: number;
      autoYieldEnabled?: boolean;
    }
  ): Promise<{
    success: boolean;
    settings?: any;
    error?: string;
  }> {
    try {
      if (!this.account) {
        throw new Error('Account not initialized');
      }

      const response = await fetch('/api/yield/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: this.account.address,
          yieldModeEnabled: enabled,
          ...options,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Unknown error',
        };
      }

      return {
        success: true,
        settings: data.settings,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get yield farming statistics
   * 
   * @returns Yield stats including deposits, accrued yield, APY
   * 
   * @example
   * ```typescript
   * const stats = await client.getYieldStats();
   * console.log(stats.totalYield); // "25.50"
   * ```
   */
  async getYieldStats(): Promise<{
    success: boolean;
    deposits?: any[];
    stats?: {
      totalDeposited: string;
      totalYield: string;
      totalBalance: string;
      activeDepositsCount: number;
    };
    error?: string;
  }> {
    try {
      if (!this.account) {
        throw new Error('Account not initialized');
      }

      const response = await fetch(
        `/api/yield/stats?userAddress=${this.account.address}`
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Unknown error',
        };
      }

      return {
        success: true,
        deposits: data.deposits,
        stats: data.stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all escrow tasks for the current user
   * 
   * @param role - Filter by 'agent' or 'provider'
   * @returns List of escrow tasks
   */
  async getEscrowTasks(role?: 'agent' | 'provider'): Promise<{
    success: boolean;
    tasks?: any[];
    error?: string;
  }> {
    try {
      if (!this.account) {
        throw new Error('Account not initialized');
      }

      const param = role === 'agent' ? 'agentAddress' : 'providerAddress';
      const response = await fetch(
        `/api/escrow/create?${param}=${this.account.address}`
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Unknown error',
        };
      }

      return {
        success: true,
        tasks: data.tasks,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}


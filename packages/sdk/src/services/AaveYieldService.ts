import { 
  createPublicClient,
  createWalletClient,
  http,
  parseUnits,
  formatUnits,
  type Address,
  type Hash,
  type WalletClient,
} from 'viem';
import { mainnet } from 'viem/chains';
import { MNEE_TOKEN_ADDRESS } from '../constants';

/**
 * Aave V3 Pool Address on Ethereum Mainnet
 */
const AAVE_V3_POOL_ADDRESS = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2' as Address;

/**
 * Aave V3 Pool ABI (simplified)
 */
const AAVE_POOL_ABI = [
  {
    name: 'supply',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'onBehalfOf', type: 'address' },
      { name: 'referralCode', type: 'uint16' },
    ],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'to', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getUserAccountData',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'totalCollateralBase', type: 'uint256' },
      { name: 'totalDebtBase', type: 'uint256' },
      { name: 'availableBorrowsBase', type: 'uint256' },
      { name: 'currentLiquidationThreshold', type: 'uint256' },
      { name: 'ltv', type: 'uint256' },
      { name: 'healthFactor', type: 'uint256' },
    ],
  },
] as const;

/**
 * Aave aToken ABI (for checking supplied balance)
 */
const ATOKEN_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'UNDERLYING_ASSET_ADDRESS',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

/**
 * Idle Yield Service for MNEE using Aave V3
 * 
 * Automatically deposits idle MNEE (>100 MNEE, inactive 24hrs) into Aave V3 to earn interest.
 */
export class AaveYieldService {
  private publicClient;
  private walletClient?: WalletClient;
  
  // Configuration
  private readonly MIN_IDLE_BALANCE = 100; // Minimum 100 MNEE to consider for yield
  private readonly IDLE_DURATION_HOURS = 24; // 24 hours of inactivity
  
  constructor(
    private rpcUrl: string,
    walletClient?: WalletClient,
  ) {
    this.publicClient = createPublicClient({
      transport: http(rpcUrl),
      chain: mainnet,
    });
    
    this.walletClient = walletClient;
  }

  /**
   * Check if a user's MNEE balance is idle and eligible for yield farming
   * 
   * @param userAddress - User's wallet address
   * @param lastTransactionTimestamp - Unix timestamp of last MNEE transaction
   * @returns Whether balance is idle and amount eligible
   */
  async checkIdleBalance(
    userAddress: Address,
    lastTransactionTimestamp: number,
  ): Promise<{
    isIdle: boolean;
    balance: string;
    idleAmount: string;
    hoursIdle: number;
  }> {
    // Get current MNEE balance
    const balance = await this.getMneeBalance(userAddress);
    const balanceNum = parseFloat(balance);
    
    // Calculate hours idle
    const currentTime = Math.floor(Date.now() / 1000);
    const hoursIdle = (currentTime - lastTransactionTimestamp) / 3600;
    
    // Check if balance meets criteria
    const isIdle = balanceNum >= this.MIN_IDLE_BALANCE && hoursIdle >= this.IDLE_DURATION_HOURS;
    
    // Calculate idle amount (entire balance if idle)
    const idleAmount = isIdle ? balance : '0';
    
    return {
      isIdle,
      balance,
      idleAmount,
      hoursIdle,
    };
  }

  /**
   * Deposit MNEE into Aave V3 Supply Pool
   * 
   * @param amount - Amount of MNEE to deposit (in MNEE units, not wei)
   * @param onBehalfOf - Address to deposit on behalf of (usually same as sender)
   * @returns Transaction hash and success status
   */
  async depositToAave(params: {
    amount: string;
    onBehalfOf: Address;
    walletClient: WalletClient;
  }): Promise<{
    success: boolean;
    txHash?: Hash;
    error?: string;
    aTokenBalance?: string;
  }> {
    try {
      const { amount, onBehalfOf, walletClient } = params;
      
      // Convert amount to wei (MNEE has 6 decimals)
      const amountInWei = parseUnits(amount, 6);
      
      // Step 1: Approve Aave Pool to spend MNEE
      const approveTx = await walletClient.writeContract({
        address: MNEE_TOKEN_ADDRESS as Address,
        abi: [{
          name: 'approve',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          outputs: [{ name: '', type: 'bool' }],
        }],
        functionName: 'approve',
        args: [AAVE_V3_POOL_ADDRESS, amountInWei],
        account: onBehalfOf,
      });
      
      // Wait for approval confirmation
      await this.publicClient.waitForTransactionReceipt({ hash: approveTx });
      
      // Step 2: Supply MNEE to Aave
      const supplyTx = await walletClient.writeContract({
        address: AAVE_V3_POOL_ADDRESS,
        abi: AAVE_POOL_ABI,
        functionName: 'supply',
        args: [
          MNEE_TOKEN_ADDRESS as Address,
          amountInWei,
          onBehalfOf,
          0, // referralCode (0 for no referral)
        ],
        account: onBehalfOf,
      });
      
      // Wait for supply confirmation
      await this.publicClient.waitForTransactionReceipt({ hash: supplyTx });
      
      // Get aToken balance after deposit
      const aTokenBalance = await this.getAaveBalance(onBehalfOf);
      
      return {
        success: true,
        txHash: supplyTx,
        aTokenBalance,
      };
    } catch (error) {
      console.error('Aave deposit failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Withdraw MNEE from Aave V3 Supply Pool
   * 
   * @param amount - Amount of MNEE to withdraw (in MNEE units, or 'max' for all)
   * @param to - Address to send withdrawn MNEE to
   * @returns Transaction hash and success status
   */
  async withdrawFromAave(params: {
    amount: string | 'max';
    to: Address;
    walletClient: WalletClient;
  }): Promise<{
    success: boolean;
    txHash?: Hash;
    withdrawnAmount?: string;
    error?: string;
  }> {
    try {
      const { amount, to, walletClient } = params;
      
      // If 'max', get full aToken balance
      let amountInWei: bigint;
      if (amount === 'max') {
        const aTokenBalance = await this.getAaveBalance(to);
        amountInWei = parseUnits(aTokenBalance, 6);
      } else {
        amountInWei = parseUnits(amount, 6);
      }
      
      // Withdraw from Aave
      const withdrawTx = await walletClient.writeContract({
        address: AAVE_V3_POOL_ADDRESS,
        abi: AAVE_POOL_ABI,
        functionName: 'withdraw',
        args: [
          MNEE_TOKEN_ADDRESS as Address,
          amountInWei,
          to,
        ],
        account: to,
      });
      
      // Wait for withdrawal confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ 
        hash: withdrawTx 
      });
      
      return {
        success: true,
        txHash: withdrawTx,
        withdrawnAmount: formatUnits(amountInWei, 6),
      };
    } catch (error) {
      console.error('Aave withdrawal failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get user's MNEE balance deposited in Aave (aToken balance)
   */
  async getAaveBalance(userAddress: Address): Promise<string> {
    try {
      // Get aMNEE token address (aToken for MNEE)
      // Note: In production, you'd need to query the Aave Pool Data Provider
      // For now, we'll use a placeholder address
      const aMneeTokenAddress = '0x0000000000000000000000000000000000000000' as Address; // TODO: Get actual aMNEE address
      
      const balance = await this.publicClient.readContract({
        address: aMneeTokenAddress,
        abi: ATOKEN_ABI,
        functionName: 'balanceOf',
        args: [userAddress],
      });

      return formatUnits(balance as bigint, 6); // MNEE has 6 decimals
    } catch (error) {
      console.error('Failed to get Aave balance:', error);
      return '0';
    }
  }

  /**
   * Get user's accrued yield (interest earned) on Aave
   * 
   * Yield = Current aToken balance - Original deposit amount
   */
  async getAccruedYield(
    userAddress: Address,
    originalDepositAmount: string,
  ): Promise<string> {
    try {
      const currentBalance = await this.getAaveBalance(userAddress);
      const currentBalanceNum = parseFloat(currentBalance);
      const originalDepositNum = parseFloat(originalDepositAmount);
      
      const yieldEarned = currentBalanceNum - originalDepositNum;
      
      return yieldEarned > 0 ? yieldEarned.toFixed(6) : '0';
    } catch (error) {
      console.error('Failed to calculate yield:', error);
      return '0';
    }
  }

  /**
   * Get current Aave supply APY for MNEE
   * 
   * @returns APY as percentage (e.g., "5.23" for 5.23%)
   */
  async getSupplyAPY(): Promise<string> {
    try {
      // In production, fetch from Aave API or on-chain data
      // For now, return a placeholder APY
      // TODO: Implement actual APY fetching from Aave V3 contracts
      
      // Typical stablecoin APY on Aave ranges from 2-7%
      return '4.5'; // 4.5% placeholder
    } catch (error) {
      console.error('Failed to get APY:', error);
      return '0';
    }
  }

  /**
   * Get user's complete Aave account data
   */
  async getUserAccountData(userAddress: Address): Promise<{
    totalCollateralBase: string;
    totalDebtBase: string;
    availableBorrowsBase: string;
    currentLiquidationThreshold: string;
    ltv: string;
    healthFactor: string;
  }> {
    try {
      const accountData = await this.publicClient.readContract({
        address: AAVE_V3_POOL_ADDRESS,
        abi: AAVE_POOL_ABI,
        functionName: 'getUserAccountData',
        args: [userAddress],
      });

      const [
        totalCollateralBase,
        totalDebtBase,
        availableBorrowsBase,
        currentLiquidationThreshold,
        ltv,
        healthFactor,
      ] = accountData as [bigint, bigint, bigint, bigint, bigint, bigint];

      return {
        totalCollateralBase: formatUnits(totalCollateralBase, 8), // Base currency has 8 decimals
        totalDebtBase: formatUnits(totalDebtBase, 8),
        availableBorrowsBase: formatUnits(availableBorrowsBase, 8),
        currentLiquidationThreshold: formatUnits(currentLiquidationThreshold, 2),
        ltv: formatUnits(ltv, 2),
        healthFactor: formatUnits(healthFactor, 18),
      };
    } catch (error) {
      console.error('Failed to get account data:', error);
      return {
        totalCollateralBase: '0',
        totalDebtBase: '0',
        availableBorrowsBase: '0',
        currentLiquidationThreshold: '0',
        ltv: '0',
        healthFactor: '0',
      };
    }
  }

  /**
   * Get MNEE balance for an address
   */
  private async getMneeBalance(address: Address): Promise<string> {
    try {
      const balance = await this.publicClient.readContract({
        address: MNEE_TOKEN_ADDRESS as Address,
        abi: [{
          name: 'balanceOf',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'account', type: 'address' }],
          outputs: [{ name: '', type: 'uint256' }],
        }],
        functionName: 'balanceOf',
        args: [address],
      });

      return formatUnits(balance as bigint, 6); // MNEE has 6 decimals
    } catch (error) {
      console.error('Failed to get MNEE balance:', error);
      return '0';
    }
  }

  /**
   * Automated yield farming workflow
   * 
   * Checks if balance is idle and automatically deposits to Aave
   */
  async autoYieldFarm(params: {
    userAddress: Address;
    lastTransactionTimestamp: number;
    walletClient: WalletClient;
    isYieldModeEnabled: boolean;
  }): Promise<{
    success: boolean;
    deposited: boolean;
    amount?: string;
    txHash?: Hash;
    reason?: string;
  }> {
    const { userAddress, lastTransactionTimestamp, walletClient, isYieldModeEnabled } = params;
    
    // Check if yield mode is enabled
    if (!isYieldModeEnabled) {
      return {
        success: true,
        deposited: false,
        reason: 'Yield mode is disabled',
      };
    }
    
    // Check if balance is idle
    const idleCheck = await this.checkIdleBalance(userAddress, lastTransactionTimestamp);
    
    if (!idleCheck.isIdle) {
      return {
        success: true,
        deposited: false,
        reason: `Balance not idle (${idleCheck.balance} MNEE, ${idleCheck.hoursIdle.toFixed(1)} hours)`,
      };
    }
    
    // Deposit idle balance to Aave
    const depositResult = await this.depositToAave({
      amount: idleCheck.idleAmount,
      onBehalfOf: userAddress,
      walletClient,
    });
    
    if (depositResult.success) {
      return {
        success: true,
        deposited: true,
        amount: idleCheck.idleAmount,
        txHash: depositResult.txHash,
      };
    } else {
      return {
        success: false,
        deposited: false,
        reason: depositResult.error,
      };
    }
  }
}

/**
 * Factory function to create AaveYieldService
 */
export function createAaveYieldService(config: {
  rpcUrl: string;
  walletClient?: WalletClient;
}) {
  return new AaveYieldService(
    config.rpcUrl,
    config.walletClient,
  );
}

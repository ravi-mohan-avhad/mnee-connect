import { 
  createSmartAccountClient,
  ENTRYPOINT_ADDRESS_V07,
  walletClientToSmartAccountSigner,
} from 'permissionless';
import { 
  createPimlicoPaymasterClient,
  createPimlicoBundlerClient,
} from 'permissionless/clients/pimlico';
import { 
  createPublicClient,
  createWalletClient,
  http,
  parseUnits,
  formatUnits,
  type Address,
  type Hash,
  type WalletClient,
  type Chain,
  type Transport,
} from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { MNEE_TOKEN_ADDRESS } from '../constants';

/**
 * Account Abstraction Service for Gasless MNEE Transactions (ERC-4337)
 * 
 * Enables AI agents to pay gas fees in MNEE instead of ETH using:
 * - Smart Account (ERC-4337)
 * - Paymaster for gas sponsorship
 * - MNEE token balance deduction for gas costs
 */
export class AccountAbstractionService {
  private publicClient;
  private paymasterClient;
  private bundlerClient;
  private chain: Chain;
  private entryPoint = ENTRYPOINT_ADDRESS_V07;

  constructor(
    private rpcUrl: string,
    private paymasterUrl?: string,
    private bundlerUrl?: string,
  ) {
    this.chain = mainnet;
    
    // Initialize public client for reading blockchain state
    this.publicClient = createPublicClient({
      transport: http(rpcUrl),
      chain: this.chain,
    });

    // Initialize Pimlico Paymaster (if URL provided)
    if (paymasterUrl) {
      this.paymasterClient = createPimlicoPaymasterClient({
        transport: http(paymasterUrl),
        entryPoint: this.entryPoint,
      });
    }

    // Initialize Pimlico Bundler (if URL provided)
    if (bundlerUrl) {
      this.bundlerClient = createPimlicoBundlerClient({
        transport: http(bundlerUrl),
        entryPoint: this.entryPoint,
      });
    }
  }

  /**
   * Create a Smart Account client for a session key
   * 
   * @param sessionKeyPrivateKey - Private key of the session (ephemeral signer)
   * @param ownerAddress - Address of the account owner
   * @returns Smart Account client
   */
  async createSmartAccount(
    sessionKeyPrivateKey: `0x${string}`,
    ownerAddress: Address,
  ) {
    const account = privateKeyToAccount(sessionKeyPrivateKey);
    
    const walletClient = createWalletClient({
      account,
      chain: this.chain,
      transport: http(this.rpcUrl),
    });

    const smartAccountSigner = walletClientToSmartAccountSigner(walletClient);

    // Create Smart Account using permissionless.js
    const smartAccountClient = await createSmartAccountClient({
      signer: smartAccountSigner,
      bundlerTransport: this.bundlerUrl ? http(this.bundlerUrl) : http(this.rpcUrl),
      entryPoint: this.entryPoint,
      chain: this.chain,
      paymaster: this.paymasterClient,
    });

    return smartAccountClient;
  }

  /**
   * Send a gasless MNEE payment using ERC-4337
   * 
   * The Paymaster sponsors the gas, then deducts equivalent MNEE from agent's balance
   * 
   * @param sessionKeyPrivateKey - Private key of the session key
   * @param ownerAddress - Address of the account owner
   * @param recipientAddress - Payment recipient
   * @param amount - Amount of MNEE to send (in MNEE units, not wei)
   * @param maxGasCostInMnee - Maximum gas cost willing to pay in MNEE
   * @returns Transaction hash and gas cost
   */
  async sendGaslessPayment(params: {
    sessionKeyPrivateKey: `0x${string}`;
    ownerAddress: Address;
    recipientAddress: Address;
    amount: string;
    maxGasCostInMnee?: string;
  }): Promise<{
    userOpHash: Hash;
    txHash?: Hash;
    gasCostInMnee: string;
    success: boolean;
    error?: string;
  }> {
    try {
      const { 
        sessionKeyPrivateKey, 
        ownerAddress, 
        recipientAddress, 
        amount,
        maxGasCostInMnee = '10', // Default max 10 MNEE for gas
      } = params;

      // Create Smart Account
      const smartAccount = await this.createSmartAccount(
        sessionKeyPrivateKey,
        ownerAddress,
      );

      // Prepare MNEE transfer calldata (ERC-20 transfer)
      const amountInWei = parseUnits(amount, 6); // MNEE has 6 decimals
      
      const transferCalldata = {
        to: MNEE_TOKEN_ADDRESS as Address,
        data: this.encodeTransferFunction(recipientAddress, amountInWei),
        value: 0n,
      };

      // Estimate gas costs
      const gasEstimate = await this.estimateUserOperationGas(
        smartAccount,
        transferCalldata,
      );

      // Convert gas cost to MNEE (assuming 1 gwei = 0.000001 ETH, ETH/MNEE ratio)
      const gasCostInMnee = await this.convertGasCostToMnee(
        gasEstimate.totalGasInWei,
      );

      // Check if gas cost exceeds max
      if (parseFloat(gasCostInMnee) > parseFloat(maxGasCostInMnee)) {
        return {
          userOpHash: '0x0' as Hash,
          success: false,
          gasCostInMnee,
          error: `Gas cost ${gasCostInMnee} MNEE exceeds max ${maxGasCostInMnee} MNEE`,
        };
      }

      // Check agent has sufficient MNEE balance for payment + gas
      const agentBalance = await this.getMneeBalance(ownerAddress);
      const totalRequired = parseFloat(amount) + parseFloat(gasCostInMnee);
      
      if (parseFloat(agentBalance) < totalRequired) {
        return {
          userOpHash: '0x0' as Hash,
          success: false,
          gasCostInMnee,
          error: `Insufficient balance. Need ${totalRequired} MNEE, have ${agentBalance} MNEE`,
        };
      }

      // Send UserOperation with Paymaster sponsorship
      const userOpHash = await smartAccount.sendUserOperation({
        calls: [transferCalldata],
      });

      // Wait for UserOperation to be included
      const receipt = await smartAccount.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      return {
        userOpHash,
        txHash: receipt.receipt.transactionHash,
        gasCostInMnee,
        success: true,
      };
    } catch (error) {
      console.error('Gasless payment failed:', error);
      return {
        userOpHash: '0x0' as Hash,
        success: false,
        gasCostInMnee: '0',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Estimate gas for a UserOperation
   */
  private async estimateUserOperationGas(
    smartAccount: any,
    call: { to: Address; data: `0x${string}`; value: bigint },
  ): Promise<{ totalGasInWei: bigint; maxFeePerGas: bigint }> {
    try {
      // Get current gas price
      const gasPrice = await this.publicClient.getGasPrice();
      
      // Estimate gas for the call (rough estimate: 100k gas for ERC-20 transfer)
      const estimatedGas = 100000n;
      
      const totalGasInWei = estimatedGas * gasPrice;
      
      return {
        totalGasInWei,
        maxFeePerGas: gasPrice,
      };
    } catch (error) {
      console.error('Gas estimation failed:', error);
      // Fallback values
      return {
        totalGasInWei: 100000n * 50000000000n, // 100k gas * 50 gwei
        maxFeePerGas: 50000000000n, // 50 gwei
      };
    }
  }

  /**
   * Convert gas cost from ETH to MNEE
   * 
   * Uses a price oracle or hardcoded ratio (for demo: 1 ETH = 3000 MNEE)
   */
  private async convertGasCostToMnee(gasCostInWei: bigint): Promise<string> {
    const gasCostInEth = formatUnits(gasCostInWei, 18);
    
    // TODO: Replace with actual ETH/MNEE price oracle (Chainlink, Uniswap, etc.)
    // For now, assume 1 ETH = 3000 MNEE (typical USD stablecoin ratio)
    const ETH_TO_MNEE_RATIO = 3000;
    
    const gasCostInMnee = parseFloat(gasCostInEth) * ETH_TO_MNEE_RATIO;
    
    return gasCostInMnee.toFixed(6); // MNEE has 6 decimals
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
   * Encode ERC-20 transfer function call
   */
  private encodeTransferFunction(to: Address, amount: bigint): `0x${string}` {
    // transfer(address,uint256) function signature
    const functionSignature = '0xa9059cbb'; // keccak256('transfer(address,uint256)').slice(0, 10)
    
    // Encode parameters: address (32 bytes padded) + amount (32 bytes)
    const addressParam = to.slice(2).padStart(64, '0');
    const amountParam = amount.toString(16).padStart(64, '0');
    
    return `${functionSignature}${addressParam}${amountParam}` as `0x${string}`;
  }

  /**
   * Deduct gas cost in MNEE from agent's balance
   * 
   * This would typically be handled by the Paymaster contract on-chain,
   * but for demo purposes, we log it as a separate transaction.
   */
  async deductGasCostInMnee(params: {
    agentAddress: Address;
    gasCostInMnee: string;
    paymasterAddress: Address;
  }): Promise<{ success: boolean; txHash?: Hash }> {
    try {
      const { agentAddress, gasCostInMnee, paymasterAddress } = params;
      
      // In production, this would be an on-chain transfer from agent to paymaster
      // For now, we'll just log it
      console.log(
        `[Paymaster] Deducting ${gasCostInMnee} MNEE from ${agentAddress} to ${paymasterAddress}`,
      );

      // TODO: Implement actual on-chain MNEE transfer for gas reimbursement
      
      return { success: true };
    } catch (error) {
      console.error('Failed to deduct gas cost:', error);
      return { success: false };
    }
  }

  /**
   * Check if a session key is authorized for gasless transactions
   */
  async isSessionKeyAuthorized(
    sessionKeyAddress: Address,
    ownerAddress: Address,
  ): Promise<boolean> {
    // TODO: Implement on-chain verification via Smart Account contract
    // For now, return true as placeholder
    return true;
  }

  /**
   * Get paymaster balance (for monitoring)
   */
  async getPaymasterBalance(paymasterAddress: Address): Promise<string> {
    try {
      const balance = await this.publicClient.getBalance({
        address: paymasterAddress,
      });

      return formatUnits(balance, 18); // ETH has 18 decimals
    } catch (error) {
      console.error('Failed to get paymaster balance:', error);
      return '0';
    }
  }
}

/**
 * Factory function to create AccountAbstractionService
 */
export function createAccountAbstractionService(config: {
  rpcUrl: string;
  paymasterUrl?: string;
  bundlerUrl?: string;
}) {
  return new AccountAbstractionService(
    config.rpcUrl,
    config.paymasterUrl,
    config.bundlerUrl,
  );
}

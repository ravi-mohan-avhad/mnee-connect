import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/paymaster/sponsor
 * 
 * Request gasless transaction sponsorship via Paymaster
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const {
      agentAddress,
      recipientAddress,
      amount,
      sessionKeyId,
      maxGasCostInMnee,
    } = body;

    // Validate input
    if (!agentAddress || !recipientAddress || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify session key is active (if provided)
    if (sessionKeyId) {
      const sessionKey = await prisma.sessionKey.findUnique({
        where: { id: sessionKeyId },
      });

      if (!sessionKey || !sessionKey.isActive) {
        return NextResponse.json(
          { error: 'Invalid or inactive session key' },
          { status: 403 }
        );
      }

      // Check if session key has expired
      if (new Date(sessionKey.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: 'Session key has expired' },
          { status: 403 }
        );
      }
    }

    // In production, this would trigger the AccountAbstractionService
    // For now, we'll create a placeholder record
    const paymasterTx = await prisma.paymasterTransaction.create({
      data: {
        userOpHash: `0x${Date.now().toString(16)}`, // Placeholder
        agentAddress,
        recipientAddress,
        amount,
        amountFormatted: amount,
        gasCostInWei: '0',
        gasCostInMnee: '0',
        sessionKeyId,
        paymasterAddress: '0x0000000000000000000000000000000000000000', // Placeholder
        status: 'PENDING',
      },
    });

    // Log webhook event
    await prisma.webhookEvent.create({
      data: {
        eventType: 'paymaster.sponsor.requested',
        payload: {
          paymasterTxId: paymasterTx.id,
          agentAddress,
          recipientAddress,
          amount,
        },
      },
    });

    return NextResponse.json({
      success: true,
      paymasterTxId: paymasterTx.id,
      userOpHash: paymasterTx.userOpHash,
      message: 'Paymaster sponsorship requested',
    });
  } catch (error) {
    console.error('Paymaster sponsor error:', error);
    
    // Log error webhook
    await prisma.webhookEvent.create({
      data: {
        eventType: 'paymaster.sponsor.failed',
        payload: { error: String(error) },
        processed: true,
        error: String(error),
      },
    });

    return NextResponse.json(
      { error: 'Failed to process paymaster request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/paymaster/sponsor
 * 
 * Get paymaster transaction status
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userOpHash = searchParams.get('userOpHash');
    const agentAddress = searchParams.get('agentAddress');

    if (userOpHash) {
      // Get specific transaction
      const tx = await prisma.paymasterTransaction.findUnique({
        where: { userOpHash },
      });

      if (!tx) {
        return NextResponse.json(
          { error: 'Transaction not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ transaction: tx });
    }

    if (agentAddress) {
      // Get all transactions for agent
      const transactions = await prisma.paymasterTransaction.findMany({
        where: { agentAddress },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return NextResponse.json({ transactions });
    }

    return NextResponse.json(
      { error: 'Missing userOpHash or agentAddress' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Paymaster GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch paymaster transactions' },
      { status: 500 }
    );
  }
}

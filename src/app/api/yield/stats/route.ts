import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/yield/stats
 * 
 * Record a yield deposit or update yield statistics
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const {
      userAddress,
      depositAmount,
      depositFormatted,
      currentBalance,
      accruedYield,
      yieldFormatted,
      aavePoolAddress,
      aTneeTokenAddress,
      depositTxHash,
      apy,
    } = body;

    // Validate input
    if (!userAddress || !depositAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create yield deposit record
    const yieldDeposit = await prisma.yieldDeposit.create({
      data: {
        userAddress,
        depositAmount,
        depositFormatted: depositFormatted || depositAmount,
        currentBalance: currentBalance || depositAmount,
        accruedYield: accruedYield || '0',
        yieldFormatted: yieldFormatted || '0',
        aavePoolAddress: aavePoolAddress || '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
        aTneeTokenAddress,
        depositTxHash,
        apy,
        isActive: true,
      },
    });

    // Log webhook event
    await prisma.webhookEvent.create({
      data: {
        eventType: 'yield.deposit.created',
        payload: {
          yieldDepositId: yieldDeposit.id,
          userAddress,
          depositAmount: depositFormatted,
          apy,
        },
      },
    });

    return NextResponse.json({
      success: true,
      yieldDeposit,
      message: 'Yield deposit recorded',
    });
  } catch (error) {
    console.error('Yield stats POST error:', error);
    
    // Log error webhook
    await prisma.webhookEvent.create({
      data: {
        eventType: 'yield.deposit.failed',
        payload: { error: String(error) },
        processed: true,
        error: String(error),
      },
    });

    return NextResponse.json(
      { error: 'Failed to record yield deposit' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/yield/stats
 * 
 * Get yield statistics for a user
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userAddress = searchParams.get('userAddress');

    if (!userAddress) {
      return NextResponse.json(
        { error: 'Missing userAddress' },
        { status: 400 }
      );
    }

    // Get all yield deposits for user
    const deposits = await prisma.yieldDeposit.findMany({
      where: { userAddress },
      orderBy: { depositedAt: 'desc' },
    });

    // Calculate total statistics
    const activeDeposits = deposits.filter(d => d.isActive);
    
    const totalDeposited = activeDeposits.reduce((sum, d) => {
      return sum + parseFloat(d.depositFormatted);
    }, 0);

    const totalYield = activeDeposits.reduce((sum, d) => {
      return sum + parseFloat(d.yieldFormatted);
    }, 0);

    const totalBalance = activeDeposits.reduce((sum, d) => {
      return sum + parseFloat(d.currentBalance);
    }, 0);

    return NextResponse.json({
      deposits,
      stats: {
        totalDeposited: totalDeposited.toFixed(6),
        totalYield: totalYield.toFixed(6),
        totalBalance: totalBalance.toFixed(6),
        activeDepositsCount: activeDeposits.length,
        lifetimeDepositsCount: deposits.length,
      },
    });
  } catch (error) {
    console.error('Yield stats GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch yield statistics' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/yield/stats
 * 
 * Update yield deposit (e.g., when withdrawing)
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    const {
      depositId,
      currentBalance,
      accruedYield,
      yieldFormatted,
      withdrawTxHash,
      isActive,
    } = body;

    if (!depositId) {
      return NextResponse.json(
        { error: 'Missing depositId' },
        { status: 400 }
      );
    }

    // Update yield deposit
    const updateData: any = {};
    if (currentBalance !== undefined) updateData.currentBalance = currentBalance;
    if (accruedYield !== undefined) updateData.accruedYield = accruedYield;
    if (yieldFormatted !== undefined) updateData.yieldFormatted = yieldFormatted;
    if (withdrawTxHash !== undefined) updateData.withdrawTxHash = withdrawTxHash;
    if (isActive !== undefined) {
      updateData.isActive = isActive;
      if (!isActive) updateData.withdrawnAt = new Date();
    }

    const yieldDeposit = await prisma.yieldDeposit.update({
      where: { id: depositId },
      data: updateData,
    });

    // Log webhook event
    await prisma.webhookEvent.create({
      data: {
        eventType: isActive === false ? 'yield.withdraw.completed' : 'yield.deposit.updated',
        payload: {
          yieldDepositId: depositId,
          currentBalance,
          accruedYield: yieldFormatted,
        },
      },
    });

    return NextResponse.json({
      success: true,
      yieldDeposit,
      message: isActive === false ? 'Yield withdrawn' : 'Yield deposit updated',
    });
  } catch (error) {
    console.error('Yield stats PUT error:', error);
    
    // Log error webhook
    await prisma.webhookEvent.create({
      data: {
        eventType: 'yield.update.failed',
        payload: { error: String(error) },
        processed: true,
        error: String(error),
      },
    });

    return NextResponse.json(
      { error: 'Failed to update yield deposit' },
      { status: 500 }
    );
  }
}

/**
 * Payment Webhook API Route
 * POST /api/webhooks/payment
 * 
 * Logs successful MNEE transfers to the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatUnits } from 'viem';

const MNEE_DECIMALS = 6;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      transactionHash,
      fromAddress,
      toAddress,
      amount,
      blockNumber,
      gasUsed,
      gasPrice,
      payerType = 'HUMAN',
      sessionKeyId,
      apiKeyId,
      metadata,
    } = body;

    // Validate required fields
    if (!transactionHash || !fromAddress || !toAddress || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if transaction already exists
    const existingTx = await prisma.transaction.findUnique({
      where: { transactionHash },
    });

    if (existingTx) {
      return NextResponse.json(
        { message: 'Transaction already recorded', transaction: existingTx },
        { status: 200 }
      );
    }

    // Format amount for display
    const amountFormatted = formatUnits(BigInt(amount), MNEE_DECIMALS);

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        transactionHash,
        fromAddress,
        toAddress,
        amount: amount.toString(),
        amountFormatted,
        status: 'CONFIRMED',
        payerType: payerType as 'HUMAN' | 'AI_AGENT',
        blockNumber: blockNumber?.toString(),
        gasUsed: gasUsed?.toString(),
        gasPrice: gasPrice?.toString(),
        confirmedAt: new Date(),
        sessionKeyId,
        apiKeyId,
        metadata: metadata || {},
      },
    });

    // Log webhook event
    await prisma.webhookEvent.create({
      data: {
        eventType: 'payment.success',
        payload: body,
        processed: true,
        processedAt: new Date(),
      },
    });

    // Update analytics (aggregate daily stats)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.analytics.upsert({
      where: {
        userId_date: {
          userId: fromAddress, // Using address as userId for now
          date: today,
        },
      },
      update: {
        totalVolume: {
          increment: amount.toString(),
        },
        transactionCount: { increment: 1 },
        agentTransactions: payerType === 'AI_AGENT' ? { increment: 1 } : undefined,
        humanTransactions: payerType === 'HUMAN' ? { increment: 1 } : undefined,
        successfulTxs: { increment: 1 },
      },
      create: {
        userId: fromAddress,
        date: today,
        totalVolume: amount.toString(),
        transactionCount: 1,
        agentTransactions: payerType === 'AI_AGENT' ? 1 : 0,
        humanTransactions: payerType === 'HUMAN' ? 1 : 0,
        successfulTxs: 1,
        failedTxs: 0,
      },
    });

    return NextResponse.json(
      {
        message: 'Payment recorded successfully',
        transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Webhook error:', error);

    // Log failed webhook
    try {
      await prisma.webhookEvent.create({
        data: {
          eventType: 'payment.error',
          payload: {},
          processed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET method to retrieve recent transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where = address
      ? {
          OR: [
            { fromAddress: address },
            { toAddress: address },
          ],
        }
      : {};

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        include: {
          apiKey: {
            select: {
              name: true,
              id: true,
            },
          },
          sessionKey: {
            select: {
              label: true,
              id: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

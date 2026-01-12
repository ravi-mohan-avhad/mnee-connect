import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    // Create 5 random transactions
    const txs = [];
    for (let i = 0; i < 5; i++) {
        const amount = Math.floor(Math.random() * 500) + 10;
        const tx = await prisma.transaction.create({
            data: {
                transactionHash: '0x' + randomBytes(32).toString('hex'),
                fromAddress: address,
                toAddress: '0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf', // MNEE Treasury
                amount: (amount * 1_000_000).toString(),
                amountFormatted: amount.toFixed(2),
                status: 'CONFIRMED',
                payerType: Math.random() > 0.5 ? 'AI_AGENT' : 'HUMAN',
                timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
            }
        });
        txs.push(tx);
    }

    // Create a mock API key
    await prisma.apiKey.create({
        data: {
            key: 'mnee_' + randomBytes(16).toString('hex'),
            name: 'Demo API Key',
            userId: address,
            permissions: ['read', 'write'],
        }
    });

    return NextResponse.json({ message: 'Demo data seeded successfully', count: txs.length });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 });
  }
}

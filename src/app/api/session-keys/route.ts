/**
 * Session Keys API Route
 * Manage AI Agent session keys
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Create a new session key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      label,
      privateKey,
      address,
      ownerAddress,
      spendLimit,
      expiresAt,
    } = body;

    // Validate required fields
    if (!privateKey || !address || !ownerAddress || !spendLimit || !expiresAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Encrypt privateKey before storing
    // In production, use encryption library like @metamask/eth-sig-util

    const sessionKey = await prisma.sessionKey.create({
      data: {
        label,
        privateKey, // Should be encrypted in production
        address,
        ownerAddress,
        spendLimit: spendLimit.toString(),
        remainingLimit: spendLimit.toString(),
        expiresAt: new Date(expiresAt * 1000), // Convert Unix timestamp to Date
      },
    });

    return NextResponse.json({ sessionKey }, { status: 201 });
  } catch (error) {
    console.error('Error creating session key:', error);
    return NextResponse.json(
      { error: 'Failed to create session key' },
      { status: 500 }
    );
  }
}

// GET - Retrieve session keys for an owner
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerAddress = searchParams.get('owner');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    if (!ownerAddress) {
      return NextResponse.json(
        { error: 'Owner address required' },
        { status: 400 }
      );
    }

    const where: any = { ownerAddress };
    
    if (activeOnly) {
      where.isActive = true;
      where.expiresAt = { gte: new Date() };
    }

    const sessionKeys = await prisma.sessionKey.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        label: true,
        address: true,
        ownerAddress: true,
        spendLimit: true,
        remainingLimit: true,
        expiresAt: true,
        createdAt: true,
        isActive: true,
        // Don't expose private key
      },
    });

    return NextResponse.json({ sessionKeys });
  } catch (error) {
    console.error('Error fetching session keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session keys' },
      { status: 500 }
    );
  }
}

// DELETE - Revoke a session key
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKeyId = searchParams.get('id');

    if (!sessionKeyId) {
      return NextResponse.json(
        { error: 'Session key ID required' },
        { status: 400 }
      );
    }

    const sessionKey = await prisma.sessionKey.update({
      where: { id: sessionKeyId },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Session key revoked',
      sessionKey,
    });
  } catch (error) {
    console.error('Error revoking session key:', error);
    return NextResponse.json(
      { error: 'Failed to revoke session key' },
      { status: 500 }
    );
  }
}

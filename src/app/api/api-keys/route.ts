/**
 * API Keys Management Route
 * Create and manage developer API keys
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Generate a secure API key
function generateApiKey(): string {
  return `mnee_${crypto.randomBytes(32).toString('hex')}`;
}

// Hash API key for storage
function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// POST - Create new API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, userId, permissions = ['read', 'write'] } = body;

    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Name and userId required' },
        { status: 400 }
      );
    }

    // Generate API key
    const apiKey = generateApiKey();
    const hashedKey = hashApiKey(apiKey);

    const apiKeyRecord = await prisma.apiKey.create({
      data: {
        key: hashedKey,
        name,
        userId,
        permissions,
      },
    });

    // Return the unhashed key only once (user must save it)
    return NextResponse.json({
      message: 'API key created successfully',
      apiKey, // Plain text key - only shown once
      id: apiKeyRecord.id,
      name: apiKeyRecord.name,
      createdAt: apiKeyRecord.createdAt,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

// GET - List API keys for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        permissions: true,
        createdAt: true,
        lastUsedAt: true,
        isActive: true,
        // Don't return the hashed key
      },
    });

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// DELETE - Revoke an API key
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKeyId = searchParams.get('id');

    if (!apiKeyId) {
      return NextResponse.json(
        { error: 'API key ID required' },
        { status: 400 }
      );
    }

    await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'API key revoked' });
  } catch (error) {
    console.error('Error revoking API key:', error);
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}

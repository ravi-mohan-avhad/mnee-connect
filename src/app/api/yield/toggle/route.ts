import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/yield/toggle
 * 
 * Enable or disable yield mode for a user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const {
      userAddress,
      yieldModeEnabled,
      autoYieldEnabled,
      minIdleBalance,
      idleDurationHours,
    } = body;

    // Validate input
    if (!userAddress) {
      return NextResponse.json(
        { error: 'Missing userAddress' },
        { status: 400 }
      );
    }

    // Upsert user settings
    const settings = await prisma.userSettings.upsert({
      where: { userAddress },
      update: {
        yieldModeEnabled: yieldModeEnabled ?? undefined,
        autoYieldEnabled: autoYieldEnabled ?? undefined,
        minIdleBalance: minIdleBalance ?? undefined,
        idleDurationHours: idleDurationHours ?? undefined,
      },
      create: {
        userAddress,
        yieldModeEnabled: yieldModeEnabled ?? false,
        autoYieldEnabled: autoYieldEnabled ?? false,
        minIdleBalance: minIdleBalance ?? '100',
        idleDurationHours: idleDurationHours ?? 24,
      },
    });

    // Log webhook event
    await prisma.webhookEvent.create({
      data: {
        eventType: 'yield.settings.updated',
        payload: {
          userAddress,
          yieldModeEnabled: settings.yieldModeEnabled,
          autoYieldEnabled: settings.autoYieldEnabled,
        },
      },
    });

    return NextResponse.json({
      success: true,
      settings,
      message: 'Yield settings updated',
    });
  } catch (error) {
    console.error('Yield toggle error:', error);
    
    // Log error webhook
    await prisma.webhookEvent.create({
      data: {
        eventType: 'yield.settings.failed',
        payload: { error: String(error) },
        processed: true,
        error: String(error),
      },
    });

    return NextResponse.json(
      { error: 'Failed to update yield settings' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/yield/toggle
 * 
 * Get yield settings for a user
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

    // Get or create default settings
    let settings = await prisma.userSettings.findUnique({
      where: { userAddress },
    });

    if (!settings) {
      // Create default settings
      settings = await prisma.userSettings.create({
        data: {
          userAddress,
          yieldModeEnabled: false,
          autoYieldEnabled: false,
          minIdleBalance: '100',
          idleDurationHours: 24,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Yield settings GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch yield settings' },
      { status: 500 }
    );
  }
}

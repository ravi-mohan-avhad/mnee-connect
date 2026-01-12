import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/escrow/release
 * 
 * Release escrow funds to service provider with task completion proof
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const {
      taskId,
      attestationUID,
      signature,
    } = body;

    // Validate input
    if (!taskId || !attestationUID) {
      return NextResponse.json(
        { error: 'Missing taskId or attestationUID' },
        { status: 400 }
      );
    }

    // Find escrow task
    const escrow = await prisma.escrowTransaction.findUnique({
      where: { taskId },
    });

    if (!escrow) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if task is still active
    if (escrow.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Task is ${escrow.status.toLowerCase()}, cannot release` },
        { status: 400 }
      );
    }

    // Check deadline
    if (new Date(escrow.deadline) < new Date()) {
      return NextResponse.json(
        { error: 'Task deadline has passed' },
        { status: 400 }
      );
    }

    // In production, verify attestation signature here
    // For now, we'll trust the attestationUID

    // Update escrow status
    const updatedEscrow = await prisma.escrowTransaction.update({
      where: { taskId },
      data: {
        status: 'COMPLETED',
        attestationUID,
        completedAt: new Date(),
      },
    });

    // Log webhook event
    await prisma.webhookEvent.create({
      data: {
        eventType: 'escrow.released',
        payload: {
          escrowId: updatedEscrow.id,
          taskId,
          providerAddress: updatedEscrow.providerAddress,
          amount: updatedEscrow.amountFormatted,
          attestationUID,
        },
      },
    });

    return NextResponse.json({
      success: true,
      escrow: updatedEscrow,
      message: 'Escrow funds released to provider',
    });
  } catch (error) {
    console.error('Escrow release error:', error);
    
    // Log error webhook
    await prisma.webhookEvent.create({
      data: {
        eventType: 'escrow.release.failed',
        payload: { error: String(error) },
        processed: true,
        error: String(error),
      },
    });

    return NextResponse.json(
      { error: 'Failed to release escrow funds' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/escrow/release (for refund)
 * 
 * Refund escrow funds to agent if deadline passed
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Missing taskId' },
        { status: 400 }
      );
    }

    // Find escrow task
    const escrow = await prisma.escrowTransaction.findUnique({
      where: { taskId },
    });

    if (!escrow) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if task is still active
    if (escrow.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Task is ${escrow.status.toLowerCase()}, cannot refund` },
        { status: 400 }
      );
    }

    // Check deadline has passed
    if (new Date(escrow.deadline) >= new Date()) {
      return NextResponse.json(
        { error: 'Deadline has not passed yet' },
        { status: 400 }
      );
    }

    // Update escrow status
    const updatedEscrow = await prisma.escrowTransaction.update({
      where: { taskId },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
      },
    });

    // Log webhook event
    await prisma.webhookEvent.create({
      data: {
        eventType: 'escrow.refunded',
        payload: {
          escrowId: updatedEscrow.id,
          taskId,
          agentAddress: updatedEscrow.agentAddress,
          amount: updatedEscrow.amountFormatted,
        },
      },
    });

    return NextResponse.json({
      success: true,
      escrow: updatedEscrow,
      message: 'Escrow funds refunded to agent',
    });
  } catch (error) {
    console.error('Escrow refund error:', error);
    
    // Log error webhook
    await prisma.webhookEvent.create({
      data: {
        eventType: 'escrow.refund.failed',
        payload: { error: String(error) },
        processed: true,
        error: String(error),
      },
    });

    return NextResponse.json(
      { error: 'Failed to refund escrow funds' },
      { status: 500 }
    );
  }
}

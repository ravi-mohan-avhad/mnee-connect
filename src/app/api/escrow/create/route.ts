import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/escrow/create
 * 
 * Create a new escrow task with locked MNEE funds
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const {
      taskId,
      agentAddress,
      providerAddress,
      amount,
      amountFormatted,
      taskDescription,
      deadline,
      autoRefund,
      contractAddress,
    } = body;

    // Validate input
    if (!taskId || !agentAddress || !providerAddress || !amount || !deadline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if task already exists
    const existingTask = await prisma.escrowTransaction.findUnique({
      where: { taskId },
    });

    if (existingTask) {
      return NextResponse.json(
        { error: 'Task already exists' },
        { status: 409 }
      );
    }

    // Create escrow transaction record
    const escrow = await prisma.escrowTransaction.create({
      data: {
        taskId,
        agentAddress,
        providerAddress,
        amount,
        amountFormatted: amountFormatted || amount,
        taskDescription: taskDescription || 'No description',
        deadline: new Date(deadline),
        autoRefund: autoRefund ?? true,
        contractAddress: contractAddress || '0x0000000000000000000000000000000000000000',
        status: 'ACTIVE',
      },
    });

    // Log webhook event
    await prisma.webhookEvent.create({
      data: {
        eventType: 'escrow.created',
        payload: {
          escrowId: escrow.id,
          taskId,
          agentAddress,
          providerAddress,
          amount: amountFormatted,
          deadline,
        },
      },
    });

    return NextResponse.json({
      success: true,
      escrow,
      message: 'Escrow task created successfully',
    });
  } catch (error) {
    console.error('Escrow creation error:', error);
    
    // Log error webhook
    await prisma.webhookEvent.create({
      data: {
        eventType: 'escrow.creation.failed',
        payload: { error: String(error) },
        processed: true,
        error: String(error),
      },
    });

    return NextResponse.json(
      { error: 'Failed to create escrow task' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/escrow/create
 * 
 * Get escrow tasks
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');
    const agentAddress = searchParams.get('agentAddress');
    const providerAddress = searchParams.get('providerAddress');
    const status = searchParams.get('status');

    if (taskId) {
      // Get specific task
      const task = await prisma.escrowTransaction.findUnique({
        where: { taskId },
      });

      if (!task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ task });
    }

    // Build filter
    const where: any = {};
    if (agentAddress) where.agentAddress = agentAddress;
    if (providerAddress) where.providerAddress = providerAddress;
    if (status) where.status = status;

    // Get filtered tasks
    const tasks = await prisma.escrowTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Escrow GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch escrow tasks' },
      { status: 500 }
    );
  }
}

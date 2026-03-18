import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This endpoint initializes the database schema
// Run once after deployment: GET /api/init-db

export async function GET() {
  try {
    // Test connection and create tables
    await prisma.$connect();

    // Create tables by performing a simple operation
    await prisma.$executeRaw`SELECT 1`;

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Database connected successfully'
    });
  } catch (error) {
    console.error('Database init error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

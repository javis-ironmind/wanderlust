import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/trips/[id]/packing - Get packing list for a trip
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: tripId } = await params;

    // Packing list is stored as part of the trip metadata
    // Return empty - this would need a separate PackingList table or JSON field

    return NextResponse.json({ items: [] });
  } catch (error) {
    console.error('Failed to fetch packing list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packing list' },
      { status: 500 }
    );
  }
}

// POST /api/trips/[id]/packing - Update packing list for a trip
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: tripId } = await params;
    const body = await request.json();

    // Packing list is stored as part of the trip metadata
    // This would need a separate PackingList table for full implementation

    return NextResponse.json({
      items: body.items || [],
    });
  } catch (error) {
    console.error('Failed to update packing list:', error);
    return NextResponse.json(
      { error: 'Failed to update packing list' },
      { status: 500 }
    );
  }
}

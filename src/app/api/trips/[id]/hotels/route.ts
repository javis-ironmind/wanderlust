import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/trips/[id]/hotels - List all hotels for a trip
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: tripId } = await params;

    // Hotels are stored as part of the trip metadata
    // Return empty array - this would need a separate Hotels table
    return NextResponse.json([]);
  } catch (error) {
    console.error('Failed to fetch hotels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotels' },
      { status: 500 }
    );
  }
}

// POST /api/trips/[id]/hotels - Add a hotel to a trip
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: tripId } = await params;
    const body = await request.json();

    // Hotels are stored as part of the trip metadata
    // This would need a separate Hotels table for full implementation

    return NextResponse.json({
      id: body.id || crypto.randomUUID(),
      name: body.name,
      address: body.address,
      latitude: body.latitude,
      longitude: body.longitude,
      checkInDate: body.checkInDate,
      checkInTime: body.checkInTime,
      checkOutDate: body.checkOutDate,
      checkOutTime: body.checkOutTime,
      confirmationNumber: body.confirmationNumber,
      phone: body.phone,
      email: body.email,
      website: body.website,
      notes: body.notes,
      cost: body.cost,
      currency: body.currency || 'USD',
      roomType: body.roomType,
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create hotel:', error);
    return NextResponse.json(
      { error: 'Failed to create hotel' },
      { status: 500 }
    );
  }
}

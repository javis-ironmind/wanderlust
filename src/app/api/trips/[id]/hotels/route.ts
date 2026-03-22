import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/trips/[id]/hotels - List all hotels for a trip
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: tripId } = await params;

    const hotels = await prisma.hotel.findMany({
      where: { tripId },
      orderBy: { checkInDate: 'asc' },
    });

    return NextResponse.json(hotels);
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

    const hotel = await prisma.hotel.create({
      data: {
        tripId,
        name: body.name,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        checkInDate: new Date(body.checkInDate),
        checkInTime: body.checkInTime,
        checkOutDate: new Date(body.checkOutDate),
        checkOutTime: body.checkOutTime,
        confirmationNumber: body.confirmationNumber,
        phone: body.phone,
        email: body.email,
        website: body.website,
        notes: body.notes,
        cost: body.cost,
        currency: body.currency || 'USD',
        roomType: body.roomType,
      },
    });

    return NextResponse.json(hotel, { status: 201 });
  } catch (error) {
    console.error('Failed to create hotel:', error);
    return NextResponse.json(
      { error: 'Failed to create hotel' },
      { status: 500 }
    );
  }
}

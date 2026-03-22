import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string; hotelId: string }>;
}

// PUT /api/trips/[id]/hotels/[hotelId] - Update a hotel
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { hotelId } = await params;
    const body = await request.json();

    const hotel = await prisma.hotel.update({
      where: { id: hotelId },
      data: {
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

    return NextResponse.json(hotel);
  } catch (error) {
    console.error('Failed to update hotel:', error);
    return NextResponse.json(
      { error: 'Failed to update hotel' },
      { status: 500 }
    );
  }
}

// DELETE /api/trips/[id]/hotels/[hotelId] - Delete a hotel
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { hotelId } = await params;

    await prisma.hotel.delete({
      where: { id: hotelId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete hotel:', error);
    return NextResponse.json(
      { error: 'Failed to delete hotel' },
      { status: 500 }
    );
  }
}

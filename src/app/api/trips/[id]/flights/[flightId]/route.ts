import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string; flightId: string }>;
}

// PUT /api/trips/[id]/flights/[flightId] - Update a flight
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { flightId } = await params;
    const body = await request.json();

    const flight = await prisma.flight.update({
      where: { id: flightId },
      data: {
        airline: body.airline,
        flightNumber: body.flightNumber,
        departureAirport: body.departureAirport,
        departureCity: body.departureCity,
        departureTime: new Date(body.departureTime),
        arrivalAirport: body.arrivalAirport,
        arrivalCity: body.arrivalCity,
        arrivalTime: new Date(body.arrivalTime),
        confirmationNumber: body.confirmationNumber,
        terminal: body.terminal,
        gate: body.gate,
        seat: body.seat,
        notes: body.notes,
        cost: body.cost,
        currency: body.currency || 'USD',
      },
    });

    return NextResponse.json(flight);
  } catch (error) {
    console.error('Failed to update flight:', error);
    return NextResponse.json(
      { error: 'Failed to update flight' },
      { status: 500 }
    );
  }
}

// DELETE /api/trips/[id]/flights/[flightId] - Delete a flight
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { flightId } = await params;

    await prisma.flight.delete({
      where: { id: flightId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete flight:', error);
    return NextResponse.json(
      { error: 'Failed to delete flight' },
      { status: 500 }
    );
  }
}

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

    // Flights are stored as part of the trip metadata
    // This would need a separate Flights table for full implementation
    // For now, return success

    return NextResponse.json({
      id: flightId,
      airline: body.airline,
      flightNumber: body.flightNumber,
      departureAirport: body.departureAirport,
      departureCity: body.departureCity,
      departureTime: body.departureTime,
      arrivalAirport: body.arrivalAirport,
      arrivalCity: body.arrivalCity,
      arrivalTime: body.arrivalTime,
      confirmationNumber: body.confirmationNumber,
      terminal: body.terminal,
      gate: body.gate,
      seat: body.seat,
      notes: body.notes,
      cost: body.cost,
      currency: body.currency || 'USD',
    });
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

    // Flights are stored as part of the trip metadata
    // This would need a separate Flights table for full implementation

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete flight:', error);
    return NextResponse.json(
      { error: 'Failed to delete flight' },
      { status: 500 }
    );
  }
}

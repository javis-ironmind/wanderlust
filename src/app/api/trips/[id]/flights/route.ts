import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/trips/[id]/flights - List all flights for a trip
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: tripId } = await params;

    // For now, flights are not stored separately in Prisma
    // They are embedded in the trip data structure
    // Return empty array - this would need a separate Flights table
    return NextResponse.json([]);
  } catch (error) {
    console.error('Failed to fetch flights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flights' },
      { status: 500 }
    );
  }
}

// POST /api/trips/[id]/flights - Add a flight to a trip
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: tripId } = await params;
    const body = await request.json();

    // Flights are stored as part of the trip metadata
    // This would need a separate Flights table for full implementation
    // For now, return success and let the client handle it

    return NextResponse.json({
      id: body.id || crypto.randomUUID(),
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
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create flight:', error);
    return NextResponse.json(
      { error: 'Failed to create flight' },
      { status: 500 }
    );
  }
}

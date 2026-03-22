import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/trips/[id]/flights - List all flights for a trip
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: tripId } = await params;

    const flights = await prisma.flight.findMany({
      where: { tripId },
      orderBy: { departureTime: 'asc' },
    });

    return NextResponse.json(flights);
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

    const flight = await prisma.flight.create({
      data: {
        tripId,
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

    return NextResponse.json(flight, { status: 201 });
  } catch (error) {
    console.error('Failed to create flight:', error);
    return NextResponse.json(
      { error: 'Failed to create flight' },
      { status: 500 }
    );
  }
}

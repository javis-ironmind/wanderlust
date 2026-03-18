import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/trips - List all trips
export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        days: {
          include: {
            activities: true,
          },
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform Prisma model to match frontend Trip type
    const transformedTrips = trips.map((trip) => ({
      id: trip.id,
      name: trip.title,
      description: trip.description || undefined,
      coverImage: trip.coverImage || undefined,
      startDate: trip.startDate?.toISOString().split('T')[0] || '',
      endDate: trip.endDate?.toISOString().split('T')[0] || '',
      notes: undefined,
      categories: [],
      createdAt: trip.createdAt.toISOString(),
      updatedAt: trip.updatedAt.toISOString(),
      days: trip.days.map((day) => ({
        id: day.id,
        date: day.date.toISOString().split('T')[0],
        notes: day.notes || undefined,
        activities: day.activities.map((activity) => ({
          id: activity.id,
          title: activity.title,
          description: activity.notes || undefined,
          category: activity.type as any,
          startTime: activity.startTime?.toISOString().slice(11, 16),
          endTime: activity.endTime?.toISOString().slice(11, 16),
          location: activity.location ? JSON.parse(activity.location as string) : undefined,
          notes: activity.notes || undefined,
          cost: activity.cost || undefined,
          currency: activity.currency || 'USD',
          confirmationNumber: activity.bookingRef || undefined,
          order: activity.order,
          url: undefined,
          imageUrl: undefined,
          reminder: undefined,
        })),
      })),
      flights: [],
      hotels: [],
      packingList: undefined,
      budgetTotal: undefined,
      copiedFrom: undefined,
    }));

    return NextResponse.json(transformedTrips);
  } catch (error) {
    console.error('Failed to fetch trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

// POST /api/trips - Create a new trip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const trip = await prisma.trip.create({
      data: {
        title: body.name,
        description: body.description,
        coverImage: body.coverImage,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        userId: 'anonymous', // TODO: Add user authentication
      },
      include: {
        days: {
          include: {
            activities: true,
          },
        },
      },
    });

    // Transform to frontend format
    const transformedTrip = {
      id: trip.id,
      name: trip.title,
      description: trip.description || undefined,
      coverImage: trip.coverImage || undefined,
      startDate: trip.startDate?.toISOString().split('T')[0] || '',
      endDate: trip.endDate?.toISOString().split('T')[0] || '',
      notes: undefined,
      categories: [],
      createdAt: trip.createdAt.toISOString(),
      updatedAt: trip.updatedAt.toISOString(),
      days: [],
      flights: [],
      hotels: [],
      packingList: undefined,
      budgetTotal: undefined,
      copiedFrom: undefined,
    };

    return NextResponse.json(transformedTrip, { status: 201 });
  } catch (error) {
    console.error('Failed to create trip:', error);
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}

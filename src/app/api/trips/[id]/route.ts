import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/trips/[id] - Get a single trip
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        days: {
          include: {
            activities: true,
          },
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

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
    };

    return NextResponse.json(transformedTrip);
  } catch (error) {
    console.error('Failed to fetch trip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip' },
      { status: 500 }
    );
  }
}

// PUT /api/trips/[id] - Update a trip
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const trip = await prisma.trip.update({
      where: { id },
      data: {
        title: body.name,
        description: body.description,
        coverImage: body.coverImage,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
      include: {
        days: {
          include: {
            activities: true,
          },
        },
      },
    });

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
    };

    return NextResponse.json(transformedTrip);
  } catch (error) {
    console.error('Failed to update trip:', error);
    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

// DELETE /api/trips/[id] - Delete a trip
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await prisma.trip.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete trip:', error);
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}

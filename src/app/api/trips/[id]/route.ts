import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Transform Prisma trip to frontend format
function transformTrip(trip: any) {
  return {
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
    days: (trip.days || []).map((day: any) => ({
      id: day.id,
      date: day.date.toISOString().split('T')[0],
      notes: day.notes || undefined,
      activities: (day.activities || []).map((activity: any) => ({
        id: activity.id,
        title: activity.title,
        description: activity.notes || undefined,
        category: activity.type,
        startTime: activity.startTime?.toISOString().slice(11, 16),
        endTime: activity.endTime?.toISOString().slice(11, 16),
        location: activity.location ? JSON.parse(activity.location) : undefined,
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

    return NextResponse.json(transformTrip(trip));
  } catch (error) {
    console.error('Failed to fetch trip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip' },
      { status: 500 }
    );
  }
}

// PUT /api/trips/[id] - Update a trip with full nested data (days and activities)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // First, delete all existing days (cascade deletes activities)
    await prisma.day.deleteMany({
      where: { tripId: id },
    });

    // Then create new days and activities
    const trip = await prisma.trip.update({
      where: { id },
      data: {
        title: body.name,
        description: body.description,
        coverImage: body.coverImage,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        days: body.days && body.days.length > 0 ? {
          create: body.days.map((day: any, dayIndex: number) => ({
            date: new Date(day.date),
            notes: day.notes,
            order: dayIndex,
            activities: day.activities && day.activities.length > 0 ? {
              create: day.activities.map((activity: any, activityIndex: number) => ({
                title: activity.title,
                type: activity.category,
                startTime: activity.startTime ? new Date(`1970-01-01T${activity.startTime}:00`) : null,
                endTime: activity.endTime ? new Date(`1970-01-01T${activity.endTime}:00`) : null,
                location: activity.location ? JSON.stringify(activity.location) : null,
                notes: activity.notes || activity.description,
                cost: activity.cost,
                currency: activity.currency || 'USD',
                bookingRef: activity.confirmationNumber,
                order: activityIndex,
              }))
            } : undefined,
          }))
        } : undefined,
      },
      include: {
        days: {
          include: {
            activities: true,
          },
          orderBy: { date: 'asc' },
        },
      },
    });

    return NextResponse.json(transformTrip(trip));
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

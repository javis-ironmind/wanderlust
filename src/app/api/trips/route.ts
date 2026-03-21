import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    const transformedTrips = trips.map(transformTrip);
    return NextResponse.json(transformedTrips);
  } catch (error) {
    console.error('Failed to fetch trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

// POST /api/trips - Create a new trip with days and activities
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Create trip with nested days and activities
    const trip = await prisma.trip.create({
      data: {
        title: body.name,
        description: body.description,
        coverImage: body.coverImage,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        userId: 'anonymous',
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

    return NextResponse.json(transformTrip(trip), { status: 201 });
  } catch (error) {
    console.error('Failed to create trip:', error);
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}

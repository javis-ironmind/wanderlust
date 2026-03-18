import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/trips/[id]/days - List all days for a trip
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: tripId } = await params;

    const days = await prisma.day.findMany({
      where: { tripId },
      include: {
        activities: true,
      },
      orderBy: { date: 'asc' },
    });

    const transformedDays = days.map((day) => ({
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
    }));

    return NextResponse.json(transformedDays);
  } catch (error) {
    console.error('Failed to fetch days:', error);
    return NextResponse.json(
      { error: 'Failed to fetch days' },
      { status: 500 }
    );
  }
}

// POST /api/trips/[id]/days - Add a new day
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: tripId } = await params;
    const body = await request.json();

    // Get the current max order
    const maxOrderDay = await prisma.day.findFirst({
      where: { tripId },
      orderBy: { order: 'desc' },
    });

    const day = await prisma.day.create({
      data: {
        date: new Date(body.date),
        notes: body.notes,
        order: maxOrderDay ? maxOrderDay.order + 1 : 0,
        tripId,
      },
      include: {
        activities: true,
      },
    });

    const transformedDay = {
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
    };

    return NextResponse.json(transformedDay, { status: 201 });
  } catch (error) {
    console.error('Failed to create day:', error);
    return NextResponse.json(
      { error: 'Failed to create day' },
      { status: 500 }
    );
  }
}

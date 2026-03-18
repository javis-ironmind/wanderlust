import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/trips/[id]/activities - Add an activity to a trip day
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: tripId } = await params;
    const body = await request.json();

    // Verify the day belongs to this trip
    const day = await prisma.day.findFirst({
      where: { id: body.dayId, tripId },
    });

    if (!day) {
      return NextResponse.json(
        { error: 'Day not found or does not belong to this trip' },
        { status: 404 }
      );
    }

    // Get the current max order for this day
    const maxOrderActivity = await prisma.activity.findFirst({
      where: { dayId: body.dayId },
      orderBy: { order: 'desc' },
    });

    const activity = await prisma.activity.create({
      data: {
        title: body.title,
        type: body.category,
        notes: body.notes || body.description,
        startTime: body.startTime ? new Date(`2000-01-01T${body.startTime}:00`) : null,
        endTime: body.endTime ? new Date(`2000-01-01T${body.endTime}:00`) : null,
        location: body.location ? JSON.stringify(body.location) : null,
        cost: body.cost,
        currency: body.currency || 'USD',
        bookingRef: body.confirmationNumber,
        order: maxOrderActivity ? maxOrderActivity.order + 1 : body.order || 0,
        dayId: body.dayId,
        metadata: body.metadata || null,
      },
    });

    const transformedActivity = {
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
    };

    return NextResponse.json(transformedActivity, { status: 201 });
  } catch (error) {
    console.error('Failed to create activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}

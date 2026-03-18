import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string; activityId: string }>;
}

// PUT /api/trips/[id]/activities/[activityId] - Update an activity
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { activityId } = await params;
    const body = await request.json();

    const activity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        title: body.title,
        type: body.category,
        notes: body.notes || body.description,
        startTime: body.startTime ? new Date(`2000-01-01T${body.startTime}:00`) : null,
        endTime: body.endTime ? new Date(`2000-01-01T${body.endTime}:00`) : null,
        location: body.location ? JSON.stringify(body.location) : null,
        cost: body.cost,
        currency: body.currency,
        bookingRef: body.confirmationNumber,
        order: body.order,
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

    return NextResponse.json(transformedActivity);
  } catch (error) {
    console.error('Failed to update activity:', error);
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    );
  }
}

// DELETE /api/trips/[id]/activities/[activityId] - Delete an activity
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { activityId } = await params;

    await prisma.activity.delete({
      where: { id: activityId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete activity:', error);
    return NextResponse.json(
      { error: 'Failed to delete activity' },
      { status: 500 }
    );
  }
}

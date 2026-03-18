import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string; dayId: string }>;
}

// PUT /api/trips/[id]/days/[dayId] - Update a day
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dayId } = await params;
    const body = await request.json();

    const day = await prisma.day.update({
      where: { id: dayId },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        notes: body.notes,
        order: body.order,
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

    return NextResponse.json(transformedDay);
  } catch (error) {
    console.error('Failed to update day:', error);
    return NextResponse.json(
      { error: 'Failed to update day' },
      { status: 500 }
    );
  }
}

// DELETE /api/trips/[id]/days/[dayId] - Delete a day
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { dayId } = await params;

    await prisma.day.delete({
      where: { id: dayId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete day:', error);
    return NextResponse.json(
      { error: 'Failed to delete day' },
      { status: 500 }
    );
  }
}

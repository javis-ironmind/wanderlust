// app/api/trips/[id]/route.ts - Single trip CRUD
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/trips/[id] - Get single trip
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        days: {
          include: {
            activities: true
          },
          orderBy: { date: 'asc' }
        }
      }
    });
    
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }
    
    return NextResponse.json(trip);
  } catch (error) {
    console.error('GET trip error:', error);
    return NextResponse.json({ error: 'Failed to fetch trip' }, { status: 500 });
  }
}

// PUT /api/trips/[id] - Update trip
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { title, description, startDate, endDate, coverImage, isCloudSync, syncStatus } = body;
    
    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (isCloudSync !== undefined) updateData.isCloudSync = isCloudSync;
    if (syncStatus !== undefined) updateData.syncStatus = syncStatus;
    
    // Increment version for conflict resolution
    updateData.version = { increment: 1 };
    
    // Update lastSyncedAt if syncing
    if (syncStatus === 'synced') {
      updateData.lastSyncedAt = new Date();
    }
    
    const trip = await prisma.trip.update({
      where: { id },
      data: updateData,
      include: {
        days: {
          include: {
            activities: true
          }
        }
      }
    });
    
    return NextResponse.json(trip);
  } catch (error) {
    console.error('PUT trip error:', error);
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
  }
}

// DELETE /api/trips/[id] - Delete trip
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.trip.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE trip error:', error);
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 });
  }
}

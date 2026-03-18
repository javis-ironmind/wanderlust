// app/api/trips/route.ts - Trips CRUD API
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/trips - List all trips for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }
    
    const trips = await prisma.trip.findMany({
      where: { userId },
      include: {
        days: {
          include: {
            activities: true
          },
          orderBy: { date: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    return NextResponse.json(trips);
  } catch (error) {
    console.error('GET trips error:', error);
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
  }
}

// POST /api/trips - Create a new trip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, startDate, endDate, userId, isCloudSync } = body;
    
    if (!title || !userId) {
      return NextResponse.json({ error: 'title and userId required' }, { status: 400 });
    }
    
    const trip = await prisma.trip.create({
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId,
        isCloudSync: isCloudSync || false,
        syncStatus: isCloudSync ? 'syncing' : 'local'
      },
      include: {
        days: true
      }
    });
    
    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error('POST trip error:', error);
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
  }
}

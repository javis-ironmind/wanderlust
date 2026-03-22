import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ templateId: string }>;
}

// GET /api/templates/[templateId] - Get a single template
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { templateId } = await params;

    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Failed to fetch template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PUT /api/templates/[templateId] - Update a template
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { templateId } = await params;
    const body = await request.json();

    const template = await prisma.template.update({
      where: { id: templateId },
      data: {
        name: body.name,
        description: body.description,
        days: body.days,
        includeDates: body.includeDates,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Failed to update template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[templateId] - Delete a template
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { templateId } = await params;

    await prisma.template.delete({
      where: { id: templateId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}

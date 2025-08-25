// app/api/resumes/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { id, title, content, layout } = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let resume;

    if (id) {
      // Mise à jour
      resume = await prisma.resume.update({
        where: { id, candidateId: userId },
        data: {
          title,
          content,
          layout,
          updatedAt: new Date(),
        },
      });
    } else {
      // Création
      resume = await prisma.resume.create({
        data: {
          title,
          content,
          layout,
          candidateId: userId,
        },
      });
    }

    return NextResponse.json({ resume });
  } catch (error) {
    console.error('Error saving resume:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
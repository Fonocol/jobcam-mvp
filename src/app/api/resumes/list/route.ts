// app/api/resumes/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const candidateId = request.headers.get('x-user-id');

    if (!candidateId) {
      return NextResponse.json({ resumes: [] }, { status: 401 });
    }

    // Récupérer tous les CVs de l'utilisateur
    const resumes = await prisma.resume.findMany({
      where: { candidateId: candidateId },
      orderBy: { updatedAt: 'desc' },
    });
    

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

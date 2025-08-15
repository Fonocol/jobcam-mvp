import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    const recruiter = await prisma.recruiter.findUnique({
      where: { userId },
      select: { 
        id: true,
        companyId: true,
        company: {
          select: {
            name: true,
            description: true,
            region: true
          }
        }
      }
    });

    if (!recruiter) {
      return NextResponse.json(
        { error: "Recruiter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(recruiter);
  } catch (error) {
    console.error("Error fetching recruiter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
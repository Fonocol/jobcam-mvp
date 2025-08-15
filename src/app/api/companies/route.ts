import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: "Company ID is required" },
      { status: 400 }
    );
  }

  try {
    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        region: true
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        region: data.region
      }
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



export async function POST(request: Request) {
  try {
    const { name, description, region, userId } = await request.json();

    // Validation
    if (!name || !region || !userId) {
      return NextResponse.json(
        { error: "Nom et région sont obligatoires" },
        { status: 400 }
      );
    }

    // Transaction Prisma modifiée
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer l'entreprise
      const company = await tx.company.create({
        data: {
          name,
          description,
          region,
        },
      });

      // 2. Lier le recruteur à l'entreprise via l'ID
      await tx.recruiter.update({
        where: { userId },
        data: {
          companyId: company.id // On utilise l'ID directement
        }
      });

      return company;
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}
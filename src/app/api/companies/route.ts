// src/app/api/companies/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Si id fourni -> comportement existant : retourne une company
    if (id) {
      const company = await prisma.company.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          region: true,
        },
      });

      if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });
      return NextResponse.json(company);
    }

    // Sinon -> LISTE avec recherche / filtres / pagination
    const q = (searchParams.get("q") || "").trim();
    const region = (searchParams.get("region") || "").trim();
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get("pageSize") || "12", 10), 1), 50);
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: any = {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        region ? { region: { equals: region } } : {},
      ],
    };

    const [total, items] = await Promise.all([
      prisma.company.count({ where }),
      prisma.company.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take,
        select: {
          id: true,
          name: true,
          description: true,
          region: true,
          // Optionnel: nombre d'offres pour chaque entreprise
          _count: { select: { jobs: true } },
        },
      }),
    ]);

    return NextResponse.json({ items, total, page, pageSize });
  } catch (error) {
    console.error("Error in /api/companies GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// (Garde le POST / PUT / etc. tels quels — inchangés)
export async function POST(request: Request) {
  try {
    const { name, description, region, userId } = await request.json();

    if (!name || !region || !userId) {
      return NextResponse.json({ error: "Nom et région sont obligatoires" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { name, description, region },
      });

      await tx.recruiter.update({
        where: { userId },
        data: { companyId: company.id },
      });

      return company;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json();
    if (!id) return NextResponse.json({ error: "Company ID is required" }, { status: 400 });

    const updatedCompany = await prisma.company.update({
      where: { id },
      data: { name: data.name, description: data.description, region: data.region },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// src/app/api/companies/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { faker } from "@faker-js/faker";
import { CompanyRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

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

    // Liste + filtres
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

// CREATE company -> set recruiter as COMPANY_MANAGER
export async function POST(request: Request) {
  try {
    // Option A: utiliser la session (recommandé)
    const session = await getServerSession(authConfig);
    const { name, description, region, city, website, userId: bodyUserId } = await request.json();

    // soit on prend l'id de la session, soit on tolère body.userId (MVP)
    const userId = session?.user?.id ?? bodyUserId;

    if (!name || !region || !userId) {
      return NextResponse.json({ error: "Nom, région et userId sont requis" }, { status: 400 });
    }

    const me = await prisma.recruiter.findUnique({
      where: { userId },
      select: { id: true, companyId: true },
    });
    if (!me) return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });
    if (me.companyId) return NextResponse.json({ error: "Recruiter already has a company" }, { status: 400 });

    const company = await prisma.$transaction(async (tx) => {
      const created = await tx.company.create({
        data: {
          name,
          description,
          region,
          city,
          website,
          slug: `${slugify(name)}-${faker.string.alphanumeric(4).toLowerCase()}`,
        },
      });

      await tx.recruiter.update({
        where: { userId },
        data: { companyId: created.id, roleInCompany: CompanyRole.COMPANY_MANAGER },
      });

      return created;
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}

// UPDATE company -> only COMPANY_MANAGER of that company
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    const { id, name, description, region, city, website } = await request.json();
    if (!id) return NextResponse.json({ error: "Company ID is required" }, { status: 400 });

    // vérifie le rôle du recruteur connecté
    const me = await prisma.recruiter.findUnique({
      where: { userId: session?.user?.id ?? "" },
      select: { companyId: true, roleInCompany: true },
    });
    if (!me || me.companyId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (me.roleInCompany !== "COMPANY_MANAGER") {
      return NextResponse.json({ error: "Only managers can update company" }, { status: 403 });
    }

    const updatedCompany = await prisma.company.update({
      where: { id },
      data: { name, description, region, city, website },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

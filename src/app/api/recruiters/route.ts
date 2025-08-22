// src/app/api/recruiters/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import { faker } from "@faker-js/faker";

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  try {
    const recruiter = await prisma.recruiter.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        companyId: true,
        User: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
        Company: { select: { id: true, name: true, description: true, region: true } },
      },
    });

    if (!recruiter) return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });
    return NextResponse.json(recruiter);
  } catch (err) {
    console.error("GET /api/recruiters error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

    const body = await request.json();
    // body may contain: name (user), company: { name, description, region }
    const { name, company } = body;

    // Ensure session.user.id corresponds to a recruiter
    const recruiter = await prisma.recruiter.findUnique({ where: { userId: session.user.id } });
    if (!recruiter) return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });

    const updates: any[] = [];

    // Update user name if provided
    if (typeof name === "string") {
      updates.push(
        prisma.user.update({
          where: { id: session.user.id },
          data: { name },
          select: { id: true, name: true, email: true },
        })
      );
    }

    // Update or create company info (if recruiter has companyId)
    if (company && typeof company === "object") {
      const { name: compName, description, region } = company;
      if (recruiter.companyId) {
        updates.push(
          prisma.company.update({
            where: { id: recruiter.companyId },
            data: {
              ...(compName ? { name: compName } : {}),
              ...(description !== undefined ? { description } : {}),
              ...(region !== undefined ? { region } : {}),
            },
            select: { id: true, name: true, description: true, region: true },
          })
        );
      } else if (compName) {
        // create company and link recruiter
        updates.push(
          prisma.company.create({
            data: { name: compName, description, region,slug:slugify(name) + "-" + faker.number.int({ min: 1000, max: 9999 }), },
            select: { id: true, name: true, description: true, region: true },
          })
        );
        // and update recruiter -> companyId after creation (we do it below)
      }
    }

    const results = await Promise.all(updates);

    // If company was created (no companyId before) and results include the created company, link it
    if (!recruiter.companyId && company?.name) {
      const createdCompany = results.find((r) => r && r.id && r.name);
      if (createdCompany) {
        await prisma.recruiter.update({
          where: { id: recruiter.id },
          data: { companyId: createdCompany.id },
        });
      }
    }

    // Return fresh recruiter payload
    const updated = await prisma.recruiter.findUnique({
      where: { id: recruiter.id },
      select: {
        id: true,
        userId: true,
        companyId: true,
        User: { select: { id: true, name: true, email: true } },
        Company: { select: { id: true, name: true, description: true, region: true } },
      },
    });

    return NextResponse.json({ ok: true, recruiter: updated });
  } catch (err) {
    console.error("PATCH /api/recruiters error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

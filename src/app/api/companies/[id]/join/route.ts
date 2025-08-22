// src/app/api/companies/[companyId]/join/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import { CompanyRole } from "@prisma/client";

export async function POST(
  _req: Request,
  { params }: { params: Record<string, string | undefined> }
) {
  try {
    
    const companyId =  params.id;
    if (!companyId) {
      return NextResponse.json({ ok: false, error: "Missing company id in route" }, { status: 400 });
    }

    const session = await getServerSession(authConfig);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // verify company exists
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ ok: false, error: "Company not found" }, { status: 404 });
    }

    // fetch recruiter BEFORE update
    const before = await prisma.recruiter.findUnique({
      where: { userId },
      select: { id: true, userId: true, companyId: true, roleInCompany: true },
    });

    if (!before) {
      return NextResponse.json({ ok: false, error: "Recruiter not found" }, { status: 404 });
    }

    if (before.companyId && before.companyId !== companyId) {
      return NextResponse.json({ ok: false, error: "Already in another company" }, { status: 400 });
    }

    // update
    const updated = await prisma.recruiter.update({
      where: { id: before.id },
      data: { companyId, roleInCompany: CompanyRole.MEMBER },
    });

    // re-read to be 100% sure
    const after = await prisma.recruiter.findUnique({
      where: { id: before.id },
      select: { id: true, userId: true, companyId: true, roleInCompany: true },
    });

    return NextResponse.json({ ok: true, before, updated, after });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

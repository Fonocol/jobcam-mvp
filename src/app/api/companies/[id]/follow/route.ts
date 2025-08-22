// src/app/api/companies/[id]/follow/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/auth.config";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = params.id;
    const userId = session.user.id;

    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) {
      return NextResponse.json({ error: "User is not a candidate" }, { status: 400 });
    }

    try {
      await prisma.companyFollow.create({
        data: { companyId, candidateId: candidate.id },
      });
      return NextResponse.json({ ok: true }, { status: 201 });
    } catch (e: any) {
      // Duplicate (already following)
      if (e?.code === "P2002") return NextResponse.json({ ok: true, note: "already_following" }, { status: 200 });
      console.error("Create follow error:", e);
      return NextResponse.json({ error: "failed_to_follow" }, { status: 500 });
    }
  } catch (err) {
    console.error("POST /follow error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = params.id;
    const userId = session.user.id;

    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) {
      return NextResponse.json({ error: "User is not a candidate" }, { status: 400 });
    }

    await prisma.companyFollow.deleteMany({
      where: { companyId, candidateId: candidate.id },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /follow error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

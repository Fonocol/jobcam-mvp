// src/app/api/candidates/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        headline: true,
        locationState: true,
        resumeUrl: true,
        User: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
        applications: { take: 5, orderBy: { createdAt: "desc" }, select: { id: true, jobId: true, createdAt: true, status: true } },
      },
    });

    if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    return NextResponse.json(candidate);
  } catch (err) {
    console.error("GET /api/candidates error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

    const body = await request.json();
    // body may contain: name (user), headline, location, resumeUrl
    const { name, headline, locationState, resumeUrl } = body;

    const candidate = await prisma.candidate.findUnique({ where: { userId: session.user.id } });
    if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

    // Update candidate fields
    const candidateUpdate = await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        ...(headline !== undefined ? { headline } : {}),
        ...(locationState !== undefined ? { locationState } : {}),
        ...(resumeUrl !== undefined ? { resumeUrl } : {}),
      },
      select: { id: true, headline: true, locationState: true, resumeUrl: true },
    });

    // Optionally update user.name
    let userUpdate = null;
    if (typeof name === "string") {
      userUpdate = await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
        select: { id: true, name: true, email: true },
      });
    }

    return NextResponse.json({ ok: true, candidate: candidateUpdate, user: userUpdate });
  } catch (err) {
    console.error("PATCH /api/candidates error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

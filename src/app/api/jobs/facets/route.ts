// src/app/api/jobs/facets/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Prisma distinct sur champs scalaires
    const [regionsRaw, typesRaw] = await Promise.all([
      prisma.job.findMany({ where: { region: { not: null } }, distinct: ["region"], select: { region: true } }),
      prisma.job.findMany({ where: { type: { not: null } }, distinct: ["type"], select: { type: true } }),
    ]);

    const regions = regionsRaw.map((r) => r.region).filter(Boolean) as string[];
    const types = typesRaw.map((t) => t.type).filter(Boolean) as string[];

    return NextResponse.json({ regions, types });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur facets" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, candidateId, message, cvUrl } = body;

    if (!jobId || !candidateId) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const app = await prisma.application.create({
      data: { jobId, candidateId, message, cvUrl },
    });

    return NextResponse.json(app);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

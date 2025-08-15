// src/app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const region = searchParams.get("region") || "";
    const type = searchParams.get("type") || "";

    const jobs = await prisma.job.findMany({
      where: {
        title: { contains: q, mode: "insensitive" },
        region: region ? { equals: region } : undefined,
        type: type ? { equals: type } : undefined,
      },
      include: { 
        Company: true 
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des offres" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" }, 
        { status: 401 }
      );
    }

    if (session.user.role !== "RECRUITER") {
      return NextResponse.json(
        { error: "Accès interdit" }, 
        { status: 403 }
      );
    }

    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: session.user.id },
      select: { companyId: true },
    });

    if (!recruiter?.companyId) {
      return NextResponse.json(
        { error: "Aucune entreprise associée" }, 
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, description, region, type } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Titre et description sont obligatoires" },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: { 
        title, 
        description, 
        companyId: recruiter.companyId,
        region: region || null,
        type: type || null,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'offre" },
      { status: 500 }
    );
  }
}
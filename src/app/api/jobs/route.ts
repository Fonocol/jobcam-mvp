
// src/app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const region = (searchParams.get("region") || "").trim();
    const type = (searchParams.get("type") || "").trim();

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get("pageSize") || "12", 10), 1),
      50
    );
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: any = {
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        region ? { region: { equals: region } } : {},
        type ? { type: { equals: type } } : {},
      ],
    };

    // Exécute count + findMany en parallèle
    const [total, items] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        include: { Company: true },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
    ]);

    return NextResponse.json({ items, total, page, pageSize });
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
    if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    if (session.user.role !== "RECRUITER")
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });

    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: session.user.id },
      select: { companyId: true },
    });
    if (!recruiter?.companyId)
      return NextResponse.json({ error: "Aucune entreprise associée" }, { status: 400 });

    const body = await req.json();
    const { title, description, region, type } = body;
    if (!title || !description)
      return NextResponse.json({ error: "Titre et description sont obligatoires" }, { status: 400 });

    const job = await prisma.job.create({
      data: {
        title,
        description,
        companyId: recruiter.companyId,
        region: region || null, // OK si Job.region est String?
        type: type || null,     // OK si Job.type est String?
      },
      include: { Company: true },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la création de l'offre" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    if (session.user.role !== "RECRUITER")
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    // Optionnel mais recommandé : vérifier que l'offre appartient bien à la company du recruiter
    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: session.user.id },
      select: { companyId: true },
    });
    const job = await prisma.job.findUnique({ where: { id }, select: { companyId: true } });
    if (!job || job.companyId !== recruiter?.companyId)
      return NextResponse.json({ error: "Non autorisé à supprimer cette offre" }, { status: 403 });

    await prisma.job.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}







// // src/app/api/jobs/route.ts
// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authConfig } from "@/auth.config";
// import { prisma } from "@/lib/prisma";

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const q = searchParams.get("q") || "";
//     const region = searchParams.get("region") || "";
//     const type = searchParams.get("type") || "";

//     const jobs = await prisma.job.findMany({
//       where: {
//         title: { contains: q, mode: "insensitive" },
//         region: region ? { equals: region } : undefined,
//         type: type ? { equals: type } : undefined,
//       },
//       include: { 
//         Company: true 
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     return NextResponse.json(jobs);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Erreur lors de la récupération des offres" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authConfig);

//     if (!session) {
//       return NextResponse.json(
//         { error: "Non authentifié" }, 
//         { status: 401 }
//       );
//     }

//     if (session.user.role !== "RECRUITER") {
//       return NextResponse.json(
//         { error: "Accès interdit" }, 
//         { status: 403 }
//       );
//     }

//     const recruiter = await prisma.recruiter.findUnique({
//       where: { userId: session.user.id },
//       select: { companyId: true },
//     });

//     if (!recruiter?.companyId) {
//       return NextResponse.json(
//         { error: "Aucune entreprise associée" }, 
//         { status: 400 }
//       );
//     }

//     const body = await req.json();
//     const { title, description, region, type } = body;

//     if (!title || !description) {
//       return NextResponse.json(
//         { error: "Titre et description sont obligatoires" },
//         { status: 400 }
//       );
//     }

//     const job = await prisma.job.create({
//       data: { 
//         title, 
//         description, 
//         companyId: recruiter.companyId,
//         region: region || null,
//         type: type || null,
//       },
//     });

//     return NextResponse.json(job, { status: 201 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Erreur lors de la création de l'offre" },
//       { status: 500 }
//     );
//   }
// }



// export async function DELETE(request: Request) {
//   const { id } = await request.json();

//   if (!id) {
//     return NextResponse.json({ error: "ID manquant" }, { status: 400 });
//   }

//   try {
//     await prisma.job.delete({ where: { id } });
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Erreur lors de la suppression" },
//       { status: 500 }
//     );
//   }
// }

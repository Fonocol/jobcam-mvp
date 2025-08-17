import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import ApplicationTable from "./ApplicationTable";

export default async function JobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;  
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== "RECRUITER") redirect("/");

  // *** Requête Prisma corrigée : Company (avec majuscule)
  const rawApplications = await prisma.application.findMany({
    where: { 
      jobId: id,
      // ici on utilise "Company" (comme dans ton modèle Job.include précédemment)
      Job: { Company: { recruiters: { some: { userId: session.user.id } } } }
    },
    include: {
      Candidate: {
        include: { User: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Mapper pour correspondre exactement au type attendu par ApplicationTable
  const applications = rawApplications.map(app => {
    // garde des garde-fous si certaines relations venaient à être nulles
    const candidate = app.Candidate;
    const user = candidate?.User;

    return {
      id: app.id,
      // normalisation des champs optionnels vers des strings si nécessaire
      message: app.message ?? "",
      cvUrl: app.cvUrl ?? "",
      Candidate: {
        User: {
          name: user?.name ?? "Nom inconnu",
          email: user?.email ?? "email@inconnu"
        }
      }
    };
  });

  const job = await prisma.job.findUnique({
    where: { id: id },
    select: { title: true }
  });

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Candidatures pour : {job?.title}
        </h1>
        <a
          href={`/jobs/${id}`}
          className="text-blue-500 hover:underline"
        >
          Retour à l'offre
        </a>
      </div>
      
      <ApplicationTable applications={applications} />
    </div>
  );
}

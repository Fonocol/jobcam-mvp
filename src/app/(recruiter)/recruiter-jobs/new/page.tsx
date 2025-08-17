// src/app/(recruiter)/jobs/new/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import NewJobForm from "@/components/NewJobForm";

export default async function NewJobPage() {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "RECRUITER") {
    redirect("/");
  }

  // Récupère le companyId du recruteur
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: session.user.id },
    select: { companyId: true },
  });

  if (!recruiter?.companyId) {
    // pas de company assignée => rediriger ou afficher message
    redirect("/company/new");
  }

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Nouvelle offre</h1>
      <NewJobForm companyId={recruiter.companyId} />
    </main>
  );
}

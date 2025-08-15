import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import CompanyForm from "@/components/CompanyForm";

export default async function NewCompanyPage() {
  const session = await getServerSession(authConfig);
  
  // Vérification de l'authentification et du rôle
  if (!session || session.user.role !== "RECRUITER") redirect("/login");

  // Vérifier si le recruteur a déjà une entreprise
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: session.user.id },
    select: { companyId: true }
  });

  if (recruiter?.companyId) {
    redirect("/company");
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Créer votre entreprise</h1>
      <CompanyForm userId={session.user.id} />
    </div>
  );
}
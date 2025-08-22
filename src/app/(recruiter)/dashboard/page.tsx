// src/app/(recruiter)/dashboard/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import DashboardStats from "@/components/DashboardStats";
import JobTable from "@/components/JobTable";
import Link from "next/link";

export default async function RecruiterDashboard() {
  // 1) Auth + rôle global
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== "RECRUITER") {
    redirect("/");
  }

  // 2) Récupère le profil recruteur + company + rôle dans la company
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: session.user.id },
    include: {
      Company: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!recruiter) {
    // l'utilisateur n'a pas de profil recruteur
    redirect("/");
  }

  if (!recruiter.Company) {
    // pas d’entreprise rattachée → création
    redirect("/company/new");
  }

  // 3) Récupère UNIQUEMENT les jobs créés par CE recruteur
  const jobs = await prisma.job.findMany({
    where: { postedById: recruiter.id },
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // 4) Total des candidatures sur ses offres
  const applicationCount = jobs.reduce(
    (sum, j) => sum + (j._count?.applications ?? 0),
    0
  );

  const isManager = recruiter.roleInCompany === "COMPANY_MANAGER";

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <p className="text-sm text-gray-500">
            Entreprise&nbsp;:{" "}
            <Link
              href={`/companies/${recruiter.Company.id}`}
              className="underline decoration-sky-300 hover:text-sky-700"
            >
              {recruiter.Company.name}
            </Link>{" "}
            <span className="mx-2">•</span>
            Rôle&nbsp;:{" "}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${
                isManager
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              {isManager ? "COMPANY_MANAGER" : "MEMBER"}
            </span>
          </p>
        </div>

        <div className="flex gap-2">
          {isManager && (
            <Link
              href="/company/edit"
              className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50"
            >
              Modifier l'entreprise
            </Link>
          )}

          <Link
            href="/recruiter-jobs/new"
            className="px-3 py-2 rounded-md bg-sky-600 text-white text-sm hover:opacity-95"
          >
            + Nouvelle offre
          </Link>
        </div>
      </div>

      {/* Stats */}
      <DashboardStats jobCount={jobs.length} applicationCount={applicationCount} />

      {/* Jobs list */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Vos offres d’emploi</h2>
          <Link
            href="/recruiter-jobs/new"
            className="hidden sm:inline-flex px-3 py-2 rounded-md bg-sky-600 text-white text-sm hover:opacity-95"
          >
            + Nouvelle offre
          </Link>
        </div>

        {jobs.length > 0 ? (
          <JobTable jobs={jobs} />
        ) : (
          <div className="p-6 bg-white border rounded-lg text-gray-600">
            Vous n'avez pas encore publié d'offre. Cliquez sur{" "}
            <strong>+ Nouvelle offre</strong> pour en créer une.
          </div>
        )}
      </div>
    </div>
  );
}

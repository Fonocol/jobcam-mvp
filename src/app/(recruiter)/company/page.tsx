// src/app/(recruiter)/company/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import dynamic from "next/dynamic";

// charge le composant client sans SSR (client-only)
const JoinCompanyList = dynamic(() => import("@/components/JoinCompanyList"));

export default async function CompanyPage() {
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== "RECRUITER") redirect("/");

  // Récupère le recruteur + company + roleInCompany
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: session.user.id },
    include: { Company: true },
  });

  // Si pas de profil recruteur -> rediriger vers l'accueil
  if (!recruiter) {
    redirect("/");
  }

  // Si recruteur n'a pas d'entreprise : proposer Create OR Join
  if (!recruiter.companyId) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Aucune entreprise rattachée</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border rounded bg-white">
            <h2 className="font-semibold">Créer une entreprise</h2>
            <p className="text-sm text-gray-600 mt-2">
              Créez le profil de votre entreprise et devenez son <strong>COMPANY_MANAGER</strong>.
            </p>
            <Link
              href="/company/new"
              className="inline-block mt-4 bg-sky-600 text-white px-4 py-2 rounded"
            >
              Créer
            </Link>
          </div>

          <div className="p-4 border rounded bg-white">
            <h2 className="font-semibold">Rejoindre une entreprise</h2>
            <p className="text-sm text-gray-600 mt-2">
              Rejoignez une entreprise existante en tant que <strong>MEMBER</strong>. (MVP : adhésion automatique)
            </p>

            {/* Composant client qui affiche une liste / recherche et permet de rejoindre */}
            <div className="mt-3">
              {/* On passe recruiterId au composant client */}
              <JoinCompanyList recruiterId={recruiter.id} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur a une entreprise : show profile
  const isManager = recruiter.roleInCompany === "COMPANY_MANAGER";

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mon entreprise</h1>

      <div className="p-4 border rounded bg-white">
        <h2 className="font-semibold text-lg">{recruiter.Company?.name ?? "—"}</h2>
        <p className="text-sm text-gray-500">
          {recruiter.Company?.region ?? "Région non précisée"}
          {recruiter.Company?.city ? ` • ${recruiter.Company.city}` : ""}
        </p>

        {recruiter.Company?.description && (
          <p className="mt-3 text-gray-700">{recruiter.Company.description}</p>
        )}

        <div className="mt-4 flex gap-3">
          {isManager ? (
            <Link
              href="/company/edit"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
            >
              Modifier
            </Link>
          ) : (
            <button
              className="inline-block bg-gray-100 text-gray-800 px-4 py-2 rounded"
              disabled
              title="Seul le COMPANY_MANAGER peut modifier le profil de l'entreprise"
            >
              Modifier (réservé au manager)
            </button>
          )}

          <Link
            href={`/companies/${recruiter.Company!.id}/jobs`}
            className="inline-block border px-4 py-2 rounded text-sm hover:bg-gray-50"
          >
            Voir les offres
          </Link>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Rôle dans l'entreprise: <strong>{recruiter.roleInCompany}</strong>
        </div>
      </div>
    </div>
  );
}

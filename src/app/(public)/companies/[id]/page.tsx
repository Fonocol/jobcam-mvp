// src/app/(public)/companies/[id]/page.tsx
import React from "react";
import { prisma } from "@/lib/prisma";
import CompanyBanner from "@/components/CompanyBanner";
import CompanyTabs from "@/components/CompanyTabs";

type Props = { params: { id: string } };

export default async function CompanyPage({ params }: Props) {
  const { id } = params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      _count: { select: { jobs: true, recruiters: true, followers: true } },
      jobs: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          region: true,
          city: true,
          createdAt: true,
          salaryMin: true,
          salaryMax: true,
          currency: true,
        },
      },
      // Placeholder: events & news will be separate models later.
    },
  });

  if (!company) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <p className="text-gray-600">Entreprise introuvable.</p>
      </div>
    );
  }

  // pass minimal serializable data to client components
  const bannerData = {
    id: company.id,
    name: company.name,
    slug: company.slug,
    description: company.description ?? "",
    region: company.region ?? null,
    city: company.city ?? null,
    logoUrl: company.logoUrl ?? null,
    coverUrl: company.coverUrl ?? null,
    website: company.website ?? null,
    size: company.size ?? null,
    verified: company.verified ?? false,
    jobsCount: company._count?.jobs ?? 0,
    recruitersCount: company._count?.recruiters ?? 0,
    followersCount: company._count?.followers ?? 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Banner */}
      <CompanyBanner company={bannerData} />

      {/* Main content: grid with tabs + right column */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/main area: tabs that show jobs/events/news */}
        <main className="lg:col-span-2">
          <CompanyTabs
            companyId={company.id}
            initialJobs={company.jobs}
          />
        </main>

        {/* Right: quick profile card + recruiters preview */}
        <aside className="space-y-4">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700">Aperçu</h3>
            <p className="mt-2 text-sm text-gray-600 line-clamp-4">{company.description ?? "Aucune description."}</p>

            <ul className="mt-3 text-xs text-gray-500 space-y-1">
              <li>📍 {company.region ?? "Région non précisée"} {company.city ? `• ${company.city}` : ""}</li>
              {company.size && <li>👥 Taille : {company.size}</li>}
              {company.website && (
                <li>
                  🔗 <a href={company.website} className="text-sky-600 hover:underline" target="_blank" rel="noreferrer">Site web</a>
                </li>
              )}
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700">Statistiques</h3>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-center">
                <div className="text-lg font-bold">{company._count?.jobs ?? 0}</div>
                <div className="text-xs text-gray-500">Offres</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{company._count?.recruiters ?? 0}</div>
                <div className="text-xs text-gray-500">Recruteurs</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{company._count?.followers ?? 0}</div>
                <div className="text-xs text-gray-500">Abonnés</div>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4 text-xs text-gray-600 shadow-sm">
            <div className="font-medium text-gray-800 mb-2">À venir</div>
            <ul className="space-y-2">
              <li>📅 Événements & ateliers</li>
              <li>📰 Actualités & annonces</li>
              <li>💬 Témoignages & médias</li>
            </ul>
            <p className="mt-3 text-xs text-gray-400">Ces sections seront activées quand l'entreprise publiera du contenu.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

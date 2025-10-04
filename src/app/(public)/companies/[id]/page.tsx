// src/app/(public)/companies/[id]/page.tsx
import React from "react";
import { prisma } from "@/lib/prisma";
import CompanyBanner from "@/components/CompanyBanner";
import CompanyTabs from "@/components/CompanyTabs";

//type Props = { params: { id: string } };

// interface CompanyPageProps {
//   params: {
//     id: string;
//   };
// }

type PageProps = {
  params: {
    id: string;
  };
};




export default async function CompanyPage({ params }: PageProps) {
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
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Entreprise introuvable</h1>
          <p className="text-gray-600">L'entreprise que vous recherchez n'existe pas ou a été supprimée.</p>
        </div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <CompanyBanner company={bannerData} />

      {/* Main content: grid with tabs + right column */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left/main area: tabs that show jobs/events/news */}
          <main className="lg:col-span-2">
            <CompanyTabs
              companyId={company.id}
              initialJobs={company.jobs}
            />
          </main>

          {/* Right: quick profile card + recruiters preview */}
          <aside className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">À propos</h3>
              <p className="text-gray-700 leading-relaxed">
                {company.description || "Cette entreprise n'a pas encore fourni de description."}
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{company.region || "Région non précisée"}{company.city ? `, ${company.city}` : ""}</span>
                </div>
                
                {company.size && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Taille: {company.size}</span>
                  </div>
                )}
                
                {company.website && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <a href={company.website} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                      Site web
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Statistiques</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{company._count?.jobs ?? 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Offres</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{company._count?.recruiters ?? 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Recruteurs</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">{company._count?.followers ?? 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Abonnés</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">À venir</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Événements & ateliers</h4>
                    <p className="text-sm text-gray-500 mt-1">Découvrez les prochains événements</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Actualités & annonces</h4>
                    <p className="text-sm text-gray-500 mt-1">Restez informé des dernières nouvelles</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Témoignages & médias</h4>
                    <p className="text-sm text-gray-500 mt-1">Découvrez les expériences partagées</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-400 text-center">Ces sections seront activées quand l'entreprise publiera du contenu.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
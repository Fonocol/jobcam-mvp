"use client";

import Link from "next/link";
import { useState } from "react";

export default function CompanyBanner({ company }: {
  company: {
    id: string;
    name: string;
    description?: string | null;
    region?: string | null;
    logoUrl?: string | null ;
    website?: string | null;
    tags?: string[];
    jobsCount?: number;
    employeesCount?: number;
  }
}) {
  const [followed, setFollowed] = useState(false);

  // Placeholder images (MVP) - remplacer plus tard par des images réelles
  const placeholders = [
    "/placeholders/office-1.png",
    "/placeholders/office-2.png",
    "/placeholders/office-3.png"
  ];

  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
      {/* Cover : gradient ou image */}
      <div className="relative">
          {/* Si tu as une image de cover tu peux la mettre en background via inline style */}


        <div
        className="h-36 w-full flex items-center justify-center"
        style={{
          backgroundImage: "url('/placeholders/office-1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
        aria-hidden
      >
        <div className="text-center">
          <p className="text-sm text-sky-700/80">Entreprise</p>
          <p className="text-xs text-sky-600/60">Profil d'entreprise — MVP</p>
        </div>
      </div>


        {/* Avatar/logo qui dépasse */}
        <div className="absolute left-6 -bottom-8">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={`${company.name} logo`}
              className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-sky-200 flex items-center justify-center text-sky-800 font-semibold border-2 border-white shadow-sm">
              {company.name?.split(" ").map(w => w[0]).slice(0,2).join("")}
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="pt-10 px-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Left: nom, region, description, tags */}
          <div className="min-w-0">
            <h1 className="text-lg font-semibold leading-tight">
              {company.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{company.region ?? "Région non précisée"}</p>

            {company.description && (
              <p className="text-gray-700 mt-3 text-sm line-clamp-3">
                {company.description}
              </p>
            )}

            {/* Tags / skills (factice) */}
            <div className="mt-3 flex flex-wrap gap-2">
              {(company.tags ?? ["Tech", "Fintech", "Remote"]).slice(0,5).map((t) => (
                <span key={t} className="text-xs bg-sky-50 text-sky-700 px-2 py-1 rounded-full border border-sky-100">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: stats + actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex sm:gap-4 sm:items-center">
              <div className="text-center">
                <div className="text-sm font-semibold">{company.jobsCount ?? 8}</div>
                <div className="text-xs text-gray-500">Offres</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">{company.employeesCount ?? 24}</div>
                <div className="text-xs text-gray-500">Employés</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/companies/${company.id}`}
                className="inline-flex items-center px-3 py-1.5 border rounded text-sm text-sky-700 border-sky-200 hover:bg-sky-50"
              >
                Voir plus
              </Link>

              <button
                onClick={() => setFollowed(!followed)}
                className={`inline-flex items-center px-3 py-1.5 rounded text-sm ${followed ? "bg-gray-100 border border-gray-200 text-gray-700" : "bg-sky-600 text-white"}`}
                aria-pressed={followed}
              >
                {followed ? "Suivi" : "Suivre"}
              </button>
            </div>
          </div>
        </div>

        {/* Petite galerie factice (pour futur contenu média) */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {placeholders.map((src, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center text-xs text-gray-400 border border-gray-50">
              <img src={src} alt={`Media ${i+1}`} className="h-full w-full object-cover" onError={(e)=>{ (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
              {/* Affiche un badge si l'image n'est pas disponible */}
              <span className="sr-only">Placeholder</span>
            </div>
          ))}
        </div>

        {/* Liens sociaux / site (factice) */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <a className="text-sky-600 hover:underline" href={company.website ?? "#"}>{company.website ? "Site web" : "Site (à ajouter)"}</a>
          <span className="text-gray-400">•</span>
          <a className="text-gray-600">Twitter (factice)</a>
          <span className="text-gray-400">•</span>
          <a className="text-gray-600">LinkedIn (factice)</a>
        </div>
      </div>
    </div>
  );
}

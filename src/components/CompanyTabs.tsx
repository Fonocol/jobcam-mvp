// src/components/CompanyTabs.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";

type JobRow = {
  id: string;
  title: string;
  slug?: string | null;
  type?: string | null;
  region?: string | null;
  city?: string | null;
  createdAt: Date;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
};

export default function CompanyTabs({ companyId, initialJobs }: { companyId: string; initialJobs: JobRow[] }) {
  const [tab, setTab] = useState<"jobs" | "events" | "news">("jobs");

  return (
    <div>
      <nav className="flex gap-3 items-center">
        <button onClick={() => setTab("jobs")} className={`px-3 py-1.5 rounded-md text-sm ${tab === "jobs" ? "bg-sky-600 text-white" : "bg-white border"}`}>Offres</button>
        <button onClick={() => setTab("events")} className={`px-3 py-1.5 rounded-md text-sm ${tab === "events" ? "bg-sky-600 text-white" : "bg-white border"}`}>Événements</button>
        <button onClick={() => setTab("news")} className={`px-3 py-1.5 rounded-md text-sm ${tab === "news" ? "bg-sky-600 text-white" : "bg-white border"}`}>Actualités</button>
      </nav>

      <div className="mt-4">
        {tab === "jobs" && (
          <div className="space-y-3">
            {initialJobs.length > 0 ? initialJobs.map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block p-4 bg-white border rounded-lg hover:shadow-sm transition">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h4 className="font-medium line-clamp-1">{job.title}</h4>
                    <div className="text-xs text-gray-500">{job.type ?? "Type"} • {job.region ?? job.city ?? "Lieu"}</div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {job.salaryMin && job.salaryMax ? `${job.salaryMin.toLocaleString()}–${job.salaryMax.toLocaleString()} ${job.currency ?? "XAF"}` : <span className="text-xs text-gray-400">Salaire non précisé</span>}
                    <div className="text-xs text-gray-400 mt-1">{new Date(job.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </Link>
            )) : <p className="text-gray-500">Aucune offre pour le moment.</p>}
          </div>
        )}

        {tab === "events" && (
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600">Aucun événement encore. Quand l'entreprise publiera des événements, ils apparaîtront ici.</p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* sample placeholder event cards */}
              <div className="p-3 border rounded">
                <div className="text-xs text-gray-500">Atelier</div>
                <div className="font-medium">Atelier Product Design</div>
                <div className="text-xs text-gray-400 mt-2">Date: à venir • Lieu: Douala</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-xs text-gray-500">Webinaire</div>
                <div className="font-medium">Recrutement Tech 101</div>
                <div className="text-xs text-gray-400 mt-2">Date: à venir • En ligne</div>
              </div>
            </div>
          </div>
        )}

        {tab === "news" && (
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600">Actualités de l'entreprise — communiqués, annonces et articles.</p>
            <ul className="mt-3 space-y-3">
              <li className="p-3 border rounded">
                <div className="text-xs text-gray-500">Annonce</div>
                <div className="font-medium">Lancement d'une nouvelle équipe Data</div>
                <div className="text-xs text-gray-400 mt-1">Publié: il y a X jours</div>
              </li>
              <li className="p-3 border rounded">
                <div className="text-xs text-gray-500">Article</div>
                <div className="font-medium">Notre vision pour l'innovation</div>
                <div className="text-xs text-gray-400 mt-1">Publié: il y a X jours</div>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

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
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <nav className="flex border-b border-gray-200">
        <button 
          onClick={() => setTab("jobs")} 
          className={`px-6 py-4 font-medium text-sm relative ${tab === "jobs" 
            ? "text-blue-600" 
            : "text-gray-500 hover:text-gray-700"}`}
        >
          Offres d'emploi
          {tab === "jobs" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button 
          onClick={() => setTab("events")} 
          className={`px-6 py-4 font-medium text-sm relative ${tab === "events" 
            ? "text-blue-600" 
            : "text-gray-500 hover:text-gray-700"}`}
        >
          Événements
          {tab === "events" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button 
          onClick={() => setTab("news")} 
          className={`px-6 py-4 font-medium text-sm relative ${tab === "news" 
            ? "text-blue-600" 
            : "text-gray-500 hover:text-gray-700"}`}
        >
          Actualités
          {tab === "news" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
          )}
        </button>
      </nav>

      <div className="p-6">
        {tab === "jobs" && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-6">Offres disponibles</h3>
            {initialJobs.length > 0 ? (
              <div className="space-y-4">
                {initialJobs.map(job => (
                  <Link 
                    key={job.id} 
                    href={`/jobs/${job.id}`} 
                    className="block p-5 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-800 mb-2">{job.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span className="inline-flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {job.type || "Non spécifié"}
                          </span>
                          <span className="inline-flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.region || job.city || "Lieu non précisé"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {job.salaryMin && job.salaryMax ? (
                          <div className="text-lg font-bold text-blue-700">
                            {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()} {job.currency || "XAF"}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Salaire non précisé</span>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Publié le {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h4 className="text-lg font-medium text-gray-600 mb-2">Aucune offre pour le moment</h4>
                <p className="text-gray-500">Revenez plus tard pour découvrir les nouvelles opportunités.</p>
              </div>
            )}
          </div>
        )}

        {tab === "events" && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-6">Événements à venir</h3>
            <div className="text-center py-10">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h4 className="text-lg font-medium text-gray-600 mb-2">Aucun événement programmé</h4>
              <p className="text-gray-500">Les événements de cette entreprise seront affichés ici.</p>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 border border-gray-200 rounded-lg bg-blue-50">
                <div className="text-blue-600 font-medium mb-2">Atelier</div>
                <h4 className="font-semibold text-lg mb-2">Atelier Product Design</h4>
                <p className="text-gray-600 text-sm mb-3">Découvrez les méthodes de design utilisées par nos équipes.</p>
                <div className="text-xs text-gray-500">
                  <span className="flex items-center mb-1">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Date: à venir
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Lieu: Douala
                  </span>
                </div>
              </div>
              
              <div className="p-5 border border-gray-200 rounded-lg bg-green-50">
                <div className="text-green-600 font-medium mb-2">Webinaire</div>
                <h4 className="font-semibold text-lg mb-2">Recrutement Tech 101</h4>
                <p className="text-gray-600 text-sm mb-3">Apprenez comment préparer vos entretiens techniques.</p>
                <div className="text-xs text-gray-500">
                  <span className="flex items-center mb-1">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Date: à venir
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    En ligne
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "news" && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-6">Actualités</h3>
            <div className="text-center py-10">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h4 className="text-lg font-medium text-gray-600 mb-2">Aucune actualité pour le moment</h4>
              <p className="text-gray-500">Les actualités de cette entreprise seront affichées ici.</p>
            </div>
            
            <div className="mt-8 space-y-6">
              <div className="p-5 border border-gray-200 rounded-lg">
                <div className="text-blue-600 font-medium mb-2">Annonce</div>
                <h4 className="font-semibold text-lg mb-2">Lancement d'une nouvelle équipe Data</h4>
                <p className="text-gray-600 mb-3">Nous sommes ravis d'annoncer le lancement de notre nouvelle équipe dédiée à la science des données et à l'intelligence artificielle.</p>
                <div className="text-xs text-gray-500">Publié: il y a 2 jours</div>
              </div>
              
              <div className="p-5 border border-gray-200 rounded-lg">
                <div className="text-green-600 font-medium mb-2">Article</div>
                <h4 className="font-semibold text-lg mb-2">Notre vision pour l'innovation au Cameroun</h4>
                <p className="text-gray-600 mb-3">Découvrez comment nous envisageons l'innovation technologique et son impact sur le marché de l'emploi au Cameroun.</p>
                <div className="text-xs text-gray-500">Publié: il y a 1 semaine</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
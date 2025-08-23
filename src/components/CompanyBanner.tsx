// src/components/CompanyBanner.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type BannerProps = {
  company: {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    region?: string | null;
    city?: string | null;
    logoUrl?: string | null;
    coverUrl?: string | null;
    website?: string | null;
    size?: string | null;
    verified?: boolean;
    jobsCount?: number;
    recruitersCount?: number;
    followersCount?: number;
  };
};

export default function CompanyBanner({ company }: BannerProps) {
  const [followed, setFollowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const key = `company_follow_${company.id}`;
      setFollowed(localStorage.getItem(key) === "1");
    } catch (e) {}
  }, [company.id]);



async function toggleFollow() {
    if (loading) return;
    setLoading(true);
    const key = `company_follow_${company.id}`;
    const next = !followed;
    setFollowed(next); // optimistic
    localStorage.setItem(key, next ? "1" : "0");

    try {
      const res = await fetch(`/api/companies/${company.id}/follow`, {
        method: next ? "POST" : "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 401) {
        // not authenticated -> rollback and redirect to login
        setFollowed(!next);
        localStorage.setItem(key, (!next) ? "1" : "0");
        router.push(`/login?redirect=/companies/${company.slug ?? company.id}`);
        return;
      }

      if (!res.ok) {
        // rollback on other errors
        const body = await res.json().catch(()=>({}));
        console.warn("Follow failed", body);
        setFollowed(!next);
        localStorage.setItem(key, (!next) ? "1" : "0");
      }
    } catch (e) {
      console.error("Network error while toggling follow:", e);
      setFollowed(!next);
      localStorage.setItem(key, (!next) ? "1" : "0");
    } finally {
      setLoading(false);
    }
  }

  const initials = company.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const jobsHref = `/companies/${company.id}/jobs`;

  return (
    <div className="relative w-full">
      {/* Cover image */}
      <div className="relative h-64 md:h-80 w-full">
        {company.coverUrl ? (
          <img
            src={company.coverUrl}
            alt={`Bannière de ${company.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Company info */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={`${company.name} logo`}
                className="h-32 w-32 md:h-40 md:w-40 rounded-2xl object-cover border-4 border-white shadow-xl"
              />
            ) : (
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl bg-white flex items-center justify-center text-3xl md:text-4xl font-bold border-4 border-white shadow-xl text-gray-700">
                {initials}
              </div>
            )}
          </div>

          {/* Company details */}
<div className="flex-1 text-white">
  {/* Nom + badge vérifié */}
  <div className="flex flex-wrap items-center gap-3 mb-2">
    <h1 className="text-3xl md:text-4xl font-bold">{company.name}</h1>
    {company.verified && (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
        ✓ Vérifié
      </span>
    )}
  </div>

  {/* Description */}
  <p className="text-lg opacity-90 mb-4 max-w-3xl">
    {company.description || "Plateforme de recrutement leader au Cameroun"}
  </p>

  {/* Section infos (noire) */}
  <div className="flex flex-wrap items-center gap-4 mb-6 text-black">
    {company.region && (
      <div className="flex items-center">
        <svg
          className="w-5 h-5 mr-2 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span>
          {company.region}
          {company.city ? `, ${company.city}` : ""}
        </span>
      </div>
    )}

    {company.size && (
      <div className="flex items-center">
        <svg
          className="w-5 h-5 mr-2 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span>{company.size} employés</span>
      </div>
    )}
  </div>

  {/* Section stats (blanche semi-transparente) */}
  <div className="flex flex-wrap gap-3 text-black">
    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
      <span className="font-semibold">{company.jobsCount ?? 0}</span> offres
    </div>
    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
      <span className="font-semibold">{company.recruitersCount ?? 0}</span> recruteurs
    </div>
    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
      <span className="font-semibold">{company.followersCount ?? 0}</span> abonnés
    </div>
  </div>
</div>


          {/* Actions */}
          <div className="flex flex-col gap-4 mt-4 md:mt-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={jobsHref}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-blue-700 font-semibold shadow-md hover:bg-gray-50 transition-colors"
              >
                Voir les offres
              </Link>

              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-white text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  Site web
                </a>
              )}
            </div>

            <button
              onClick={toggleFollow}
              aria-pressed={followed}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${followed 
                ? "bg-white text-blue-700 border border-white" 
                : "bg-blue-600 text-white hover:bg-blue-700"
              } flex items-center justify-center gap-2`}
            >
              {followed ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Suivi
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Suivre
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
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
    <div className="relative rounded-2xl overflow-hidden shadow-lg">
      {/* cover + overlay (dark) */}
      <div className="relative h-44 md:h-56">
        {company.coverUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${company.coverUrl})` }}
            aria-hidden
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-sky-600 to-emerald-500" aria-hidden />
        )}

        {/* dark overlay to improve contrast */}
        <div className="absolute inset-0 bg-black/55 mix-blend-normal" aria-hidden />

        {/* subtle vignette to push focus center */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.35) 100%)" }} />
      </div>

      {/* main content placed above cover */}
      <div className="relative z-20 px-5 md:px-8 pb-6 -mt-14">
        <div className="flex items-start gap-5">
          {/* logo */}
          <div className="flex-shrink-0">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={`${company.name} logo`}
                className="h-28 w-28 rounded-2xl object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="h-28 w-28 rounded-2xl bg-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow-md text-slate-700">
                {initials}
              </div>
            )}
          </div>

          {/* title/meta/description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{company.name}</h1>
              {!company.verified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-green-50 text-green-700 border border-green-100">
                  ✓ Vérifié
                </span>
              )}
            </div>

            <div className="text-sm text-gray-500 mt-2">
              {company.region ?? "Région non précisée"}{company.city ? ` • ${company.city}` : ""}
            </div>

            <div className="mt-3 text-sm text-gray-700 line-clamp-3">{company.description ?? ""}</div>

            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <div className="text-xs bg-gray-50 px-3 py-1 rounded-full border">{company.jobsCount ?? 0} offres</div>
              <div className="text-xs bg-gray-50 px-3 py-1 rounded-full border">{company.recruitersCount ?? 0} recruteurs</div>
              <div className="text-xs bg-gray-50 px-3 py-1 rounded-full border">{company.followersCount ?? 0} abonnés</div>
              {company.size && <div className="text-xs bg-gray-50 px-3 py-1 rounded-full border">{company.size}</div>}
            </div>
          </div>

          {/* actions (ensure visible) */}
          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href={jobsHref}
                className="inline-flex items-center px-4 py-2 rounded-md bg-sky-600 text-white text-sm font-medium shadow-sm hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-sky-300"
                aria-label="Voir offres"
              >
                Voir offres
              </Link>

              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-3 py-2 rounded-md border text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  Site
                </a>
              )}
            </div>

            <button
              onClick={toggleFollow}
              aria-pressed={followed}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${followed ? "bg-white text-sky-700 border border-sky-200" : "bg-sky-600 text-white"}`}
            >
              {followed ? "Suivi" : "Suivre"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

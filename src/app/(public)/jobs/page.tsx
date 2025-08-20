// src/app/(public)/jobs/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const debounce = (fn: (...args: any[]) => void, ms = 400) => {
  let t: any;
  return (...args: any[]) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");

  const [regions, setRegions] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger facets (regions/types)
  useEffect(() => {
    fetch("/api/jobs/facets")
      .then((r) => r.json())
      .then((data) => {
        setRegions(data.regions || []);
        setTypes(data.types || []);
      })
      .catch(console.error);
  }, []);

  const doFetch = useMemo(
    () =>
      debounce(async (params: URLSearchParams) => {
        setLoading(true);
        try {
          const res = await fetch(`/api/jobs?${params.toString()}`);
          const json = await res.json();
          setJobs(json.items || []);
          setTotal(json.total || 0);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }, 300),
    []
  );

  // Fetch jobs à chaque changement de filtres / page
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (region) params.set("region", region);
    if (type) params.set("type", type);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    doFetch(params);
  }, [q, region, type, page, pageSize, doFetch]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Offres d&apos;emploi</h1>

      {/* Filtres */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          placeholder="Recherche (titre ou description)"
          className="border rounded p-2"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
        <select
          className="border rounded p-2"
          value={region}
          onChange={(e) => {
            setPage(1);
            setRegion(e.target.value);
          }}
        >
          <option value="">Toutes les régions</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          className="border rounded p-2"
          value={type}
          onChange={(e) => {
            setPage(1);
            setType(e.target.value);
          }}
        >
          <option value="">Tous les types</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <div className="flex items-center text-sm text-gray-600">
          {loading ? "Chargement..." : `${total} résultats`}
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <p>Chargement…</p>
      ) : jobs.length === 0 ? (
        <p>Aucun résultat.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="border p-4 rounded">
              <h2 className="font-semibold">{job.title}</h2>

              <div className="text-sm text-gray-600 mt-1 flex items-center gap-2 flex-wrap">
                <Link href={`/companies/${job.companyId}`} className="text-blue-500 hover:underline">
                  {job.Company?.name}
                </Link>
                {job.region && (
                  <>
                    <span>•</span>
                    <span>{job.region}</span>
                  </>
                )}
                {job.type && (
                  <>
                    <span>•</span>
                    <span>{job.type}</span>
                  </>
                )}
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <Link href={`/jobs/${job.id}`} className="text-blue-500">Voir détails</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center gap-3">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Précédent
        </button>
        <span className="text-sm">
          Page {page} / {totalPages}
        </span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Suivant
        </button>
      </div>
    </main>
  );
}

// src/app/(public)/companies/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const debounce = (fn: (...args: any[]) => void, ms = 300) => {
  let t: any;
  return (...args: any[]) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

export default function CompaniesPage() {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const regions = [
    "Toutes",
    "Centre",
    "Littoral",
    "Ouest",
    "Nord",
    "Extrême-Nord",
    "Sud",
    "Est",
    "Adamaoua",
    "Télétravail",
  ];

  const fetchCompanies = useMemo(
    () =>
      debounce(async (query: string, regionVal: string, pageVal: number) => {
        setLoading(true);
        try {
          const params = new URLSearchParams();
          if (query) params.set("q", query);
          if (regionVal && regionVal !== "Toutes") params.set("region", regionVal);
          params.set("page", String(pageVal));
          params.set("pageSize", String(pageSize));

          const res = await fetch(`/api/companies?${params.toString()}`);
          const json = await res.json();
          setItems(json.items || []);
          setTotal(json.total || 0);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }, 300),
    [pageSize]
  );

  // trigger fetch when filters change
  useEffect(() => {
    setPage(1);
    fetchCompanies(q, region, 1);
  }, [q, region, fetchCompanies]);

  // trigger fetch for page change
  useEffect(() => {
    fetchCompanies(q, region, page);
  }, [page, q, region, fetchCompanies]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Entreprises</h1>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          placeholder="Rechercher entreprises (nom ou description)"
          className="border rounded p-2"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border rounded p-2"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          {regions.map((r) => (
            <option key={r} value={r === "Toutes" ? "" : r}>
              {r}
            </option>
          ))}
        </select>
        <div className="flex items-center text-sm text-gray-600">
          {loading ? "Chargement..." : `${total} entreprises`}
        </div>
        <div className="text-right">
          <button
            className="px-3 py-1 border rounded"
            onClick={() => {
              setQ("");
              setRegion("");
              setPage(1);
              fetchCompanies("", "", 1);
            }}
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p>Chargement…</p>
      ) : items.length === 0 ? (
        <p>Aucune entreprise trouvée.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.id}`}
              className="block p-4 border rounded hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold">{company.name}</h2>
              {company.region && <p className="text-gray-600 text-sm">{company.region}</p>}
              {company.description && (
                <p className="text-gray-700 mt-2 line-clamp-3 text-sm">{company.description}</p>
              )}
              <div className="text-xs text-gray-500 mt-2">
                {company._count?.jobs ?? 0} offre(s)
              </div>
            </Link>
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

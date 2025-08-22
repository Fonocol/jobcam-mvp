"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const debounce = (fn: (...args: any[]) => void, ms = 300) => {
  let t: any;
  return (...args: any[]) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

export default function JoinCompanyList({ recruiterId }: { recruiterId?: string }) {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

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
          if (!res.ok) {
            setItems([]);
            setTotal(0);
            return;
          }
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

  useEffect(() => {
    setPage(1);
    fetchCompanies(q, region, 1);
  }, [q, region, fetchCompanies]);

  useEffect(() => {
    fetchCompanies(q, region, page);
  }, [page, q, region, fetchCompanies]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function handleJoin(companyId: string) {
    if (!confirm("Confirmez-vous que vous voulez rejoindre cette entreprise ?")) return;
    setError(null);
    setJoining(companyId);
    try {
      const res = await fetch(`/api/companies/${companyId}/join`, { method: "POST" });
      const body = await res.json().catch(() => ({}));

      if (!res.ok || !body?.ok) {
        setError(body?.error ?? body?.message ?? "Impossible de rejoindre l'entreprise");
        setJoining(null);
        return;
      }

      router.replace("/company");
      router.refresh();
    } catch (err) {
      console.error("Join failed:", err);
      setError("Erreur réseau lors de la tentative de rejoindre.");
      setJoining(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Rejoindre une entreprise</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <input
          placeholder="Rechercher..."
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          {regions.map((r) => (
            <option key={r} value={r === "Toutes" ? "" : r}>{r}</option>
          ))}
        </select>
        <button
          onClick={() => { setQ(""); setRegion(""); setPage(1); fetchCompanies("", "", 1); }}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Réinitialiser
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16">Chargement...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">Aucune entreprise trouvée</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((company) => {
            const isJoining = joining === company.id;
            return (
              <div key={company.id} className="p-4 bg-white rounded shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold">{company.name}</h2>
                  <span className="text-sm text-gray-500">{company._count?.jobs ?? 0} offre{company._count?.jobs !== 1 ? 's' : ''}</span>
                </div>
                {company.region && <div className="text-sm text-gray-400 mt-1">{company.region}</div>}
                {company.description && <p className="text-gray-600 mt-2 text-sm line-clamp-3">{company.description}</p>}
                <button
                  onClick={() => handleJoin(company.id)}
                  disabled={!!joining}
                  className={`mt-4 w-full py-2 rounded text-white font-medium ${isJoining ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isJoining ? "En cours..." : "Rejoindre"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="text-gray-700">Page {page} sur {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function EditCompanyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    region: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCompanyData() {
      if (!session?.user?.id) return;

      try {
        // 1. Get recruiter data first
        const recruiterRes = await fetch(`/api/recruiters?userId=${session.user.id}`);
        if (!recruiterRes.ok) throw new Error("Failed to fetch recruiter");
        
        const recruiter = await recruiterRes.json();
        if (!recruiter?.companyId) {
          router.push("/company/create");
          return;
        }

        // 2. Get company data
        const companyRes = await fetch(`/api/companies?id=${recruiter.companyId}`);
        if (!companyRes.ok) throw new Error("Failed to fetch company");
        
        const companyData = await companyRes.json();
        setForm(companyData);
      } catch (error) {
        console.error("Error loading company data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCompanyData();
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get companyId from recruiter first
      const recruiterRes = await fetch(`/api/recruiters?userId=${session?.user?.id}`);
      if (!recruiterRes.ok) throw new Error("Failed to fetch recruiter");
      
      const recruiter = await recruiterRes.json();
      if (!recruiter?.companyId) {
        alert("No company associated with this recruiter");
        return;
      }

      const res = await fetch(`/api/companies`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: recruiter.companyId,
          ...form
        })
      });

      if (!res.ok) throw new Error("Failed to update company");

      router.push("/company");
    } catch (error) {
      console.error("Error updating company:", error);
      alert("Failed to update company");
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Modifier l&apos;entreprise</h1>
      
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="block mb-1">Nom</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>

        <div>
          <label className="block mb-1">Région</label>
          <select
            value={form.region}
            onChange={(e) => setForm({...form, region: e.target.value})}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Sélectionner</option>
            <option value="Littoral">Littoral</option>
            <option value="Centre">Centre</option>
            {/* Autres régions */}
          </select>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/company")}
            className="border px-4 py-2 rounded hover:bg-gray-100"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
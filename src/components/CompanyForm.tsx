"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function CompanyForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    region: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          userId // On passe l'ID du recruteur
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      router.push("/company");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div>
        <label className="block mb-1">Nom de l&apos;entreprise *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})}
          className="w-full p-2 border rounded"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({...form, description: e.target.value})}
          className="w-full p-2 border rounded min-h-[120px]"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block mb-1">Région *</label>
        <select
          value={form.region}
          onChange={(e) => setForm({...form, region: e.target.value})}
          className="w-full p-2 border rounded"
          required
          disabled={isLoading}
        >
          <option value="">Sélectionnez une région</option>
          <option value="Littoral">Littoral</option>
          <option value="Centre">Centre</option>
          <option value="Sud">Sud</option>
          <option value="Nord">Nord</option>
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4 inline" />
              Création...
            </>
          ) : (
            "Créer l'entreprise"
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="border px-4 py-2 rounded hover:bg-gray-50"
          disabled={isLoading}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
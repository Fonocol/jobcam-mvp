"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewJobForm({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, region, type, description }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Erreur serveur");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Erreur réseau");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-lg">
      {error && <p className="text-red-600">{error}</p>}

      <input
        placeholder="Titre"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full rounded"
        required
      />
      <input
        placeholder="Région"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        className="border p-2 w-full rounded"
        required
      />
      <input
        placeholder="Type de contrat"
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border p-2 w-full rounded"
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full rounded"
        required
      />

      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {isLoading ? "Publication..." : "Publier"}
      </button>
    </form>
  );
}

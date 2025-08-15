"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erreur lors de l'inscription");
      setIsLoading(false);
      return;
    }

    // Auto login after registration
    const signInResponse = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    router.push(signInResponse?.url || "/");
  };

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Inscription</h1>
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" required placeholder="Nom complet" className="w-full p-2 border rounded"/>
        <input name="email" type="email" required placeholder="Email" className="w-full p-2 border rounded"/>
        <input name="password" type="password" required minLength={6} placeholder="Mot de passe" className="w-full p-2 border rounded"/>
        <select name="role" required className="w-full p-2 border rounded">
          <option value="">Sélectionnez...</option>
          <option value="CANDIDATE">Candidat</option>
          <option value="RECRUITER">Recruteur</option>
        </select>
        <button type="submit" disabled={isLoading} className="w-full py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700">
          {isLoading ? "Inscription..." : "S'inscrire"}
        </button>
      </form>
    </main>
  );
}

"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // inside RegisterPage component: replace handleSubmit with this
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const name = String(formData.get("name") || "");
      const email = String(formData.get("email") || "");
      const password = String(formData.get("password") || "");
      const role = String(formData.get("role") || "");

      // appel API register
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Erreur lors de l'inscription");
        setIsLoading(false);
        return;
      }

      // Auto login après inscription: redirect:false pour récupérer la réponse
      let signInResponse = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/",
      });

      console.log("premier signInResponse:", signInResponse);

      // Si undefined ou null, essaie un ou deux retries (la DB ou cookie peut mettre un petit temps)
      const maxRetries = 2;
      let attempt = 0;
      while ((!signInResponse || (signInResponse as any).error) && attempt < maxRetries) {
        attempt++;
        // si erreur explicite, on peut break early (optionnel) — ici on retente seulement si signInResponse est falsy
        if (signInResponse && (signInResponse as any).error) break;

        // petit délai avant retry
        await new Promise((r) => setTimeout(r, 500 * attempt));
        signInResponse = await signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl: "/",
        });
        console.log(`retry ${attempt} signInResponse:`, signInResponse);
      }

      // vérifications finales
      if (!signInResponse) {
        setError("Impossible d'obtenir de réponse du service d'authentification.");
        setIsLoading(false);
        return;
      }
      if ((signInResponse as any).error) {
        setError((signInResponse as any).error || "Connexion automatique impossible.");
        setIsLoading(false);
        return;
      }

      const target = (signInResponse as any).url || "/";

      await router.replace(target);
      // parfois utile de small delay avant refresh mais pas toujours nécessaire
      router.refresh();
    } catch (err) {
      console.error("Register error:", err);
      setError("Erreur réseau ou serveur. Réessaye plus tard.");
    } finally {
      setIsLoading(false);
    }
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

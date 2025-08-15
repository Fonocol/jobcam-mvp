"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type FormErrors = {
  email?: string;
  password?: string;
  global?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (email: string, password: string) => {
    const e: FormErrors = {};
    if (!email) e.email = "Email requis";
    // simple regex d'email (minimale) — remplace si tu veux une validation stricte
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Format d'email invalide";
    if (!password) e.password = "Mot de passe requis";
    else if (typeof password === "string" && password.length < 6) e.password = "Min. 6 caractères";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
        const formData = new FormData(e.currentTarget);
        const email = (formData.get("email") as string) || "";
        const password = (formData.get("password") as string) || "";

        // validation client (déjà présente)
        const clientErrors = validate(email, password);
        if (Object.keys(clientErrors).length) {
        setErrors(clientErrors);
        setIsLoading(false);
        return;
        }

        const response = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/", // page souhaitée après connexion
        });

        if (!response) {
        setErrors({ global: "Pas de réponse du serveur. Réessaye." });
        setIsLoading(false);
        return;
        }

        if (response.error) {
        setErrors({ global: response.error || "Identifiants invalides" });
        setIsLoading(false);
        return;
        }

        const target = (response.url as string) || "/";

        // redirection + forcer la revalidation du layout/server
        await router.replace(target);
        router.refresh();
    } catch (err) {
        console.error("Login error:", err);
        setErrors({ global: "Erreur réseau ou serveur. Réessaye plus tard." });
    } finally {
        setIsLoading(false);
    }
    };


  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Connexion</h1>

      {errors.global && (
        <div role="alert" className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {errors.global}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block mb-1 font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            aria-invalid={errors.email ? "true" : "false"}
            aria-errormessage={errors.email ? "email-error" : undefined}
            required
            placeholder="ton@mail.com"
            className="w-full p-2 border rounded"
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block mb-1 font-medium">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            aria-invalid={errors.password ? "true" : "false"}
            aria-errormessage={errors.password ? "password-error" : undefined}
            required
            minLength={6}
            placeholder="••••••••"
            className="w-full p-2 border rounded"
          />
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600">
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded text-white ${
            isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
          aria-busy={isLoading}
        >
          {isLoading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </main>
  );
}

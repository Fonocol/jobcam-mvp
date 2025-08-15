"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

export default function UserMenu({ name, role }: { name?: string; role?: string }) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <div className="text-sm">Bonjour, <strong>{name || "Utilisateur"}</strong></div>
        <div className="text-xs opacity-90">Rôle: {role || "—"}</div>
      </div>

      <div className="flex flex-col space-y-1 text-sm">
        <Link href="/profile" className="underline hover:text-blue-600">
          Profil
        </Link>

        {role === "RECRUITER" && (
          <>
            <Link href="/company" className="underline hover:text-blue-600">
              Mon entreprise
            </Link>
            <Link href="/recruiter-jobs/new" className="underline hover:text-blue-600">
              Publier offre
            </Link>
          </>
        )}
        
        <button
          onClick={handleSignOut}
          className="text-left underline hover:text-blue-600"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}
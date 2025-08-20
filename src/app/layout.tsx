// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/auth.config";
import Link from "next/link";
import UserMenu from "@/components/UserMenu";
import { Providers } from "./providers"; // Ajoutez cette ligne

export const metadata: Metadata = {
  title: "Plateforme Emploi Cameroun",
  description: "MVP pour la plateforme",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authConfig);

  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        {/* Enveloppez TOUTE votre application avec le SessionProvider */}
        <Providers session={session}> {/* Modifiez cette ligne */}
          <header className="bg-blue-600 text-white p-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Plateforme Emploi</h1>
                <nav className="flex space-x-4 mt-2">
                  <Link href="/" className="hover:underline">Accueil</Link>
                  <Link href="/jobs" className="hover:underline">Jobs</Link>
                  <Link href="/companies" className="hover:underline">Entreprises</Link>
                  {!session && <Link href="/login" className="hover:underline">Connexion</Link>}
                  {!session && <Link href="/register" className="hover:underline">Inscription</Link>}
                </nav>
              </div>

              <div>
                {session?.user ? (
                  <UserMenu name={session.user.name! ?? session.user.email} role={session.user.role} />
                ) : (
                  <div className="text-sm">Non connecté</div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-grow max-w-5xl mx-auto p-4">{children}</main>

          <footer className="bg-gray-100 p-4 text-center">
            © {new Date().getFullYear()} Plateforme Emploi - MVP
          </footer>
        </Providers> {/* N'oubliez pas de fermer le Providers */}
      </body>
    </html>
  );
}
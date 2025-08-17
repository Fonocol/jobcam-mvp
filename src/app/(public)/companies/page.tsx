// /app/(public)/companies/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    take: 20,
    orderBy: { name: "asc" }
  });

  if (companies.length === 0) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Entreprises</h1>
        <p className="text-gray-600">Aucune entreprise enregistrée pour le moment.</p>
      </div>
    );
  }

  return (
    <main className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Entreprises</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map(company => (
          <Link
            key={company.id}
            href={`/companies/${company.id}`}
            className="block p-4 border rounded hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-semibold">{company.name}</h2>
            {company.region && (
              <p className="text-gray-600 text-sm">{company.region}</p>
            )}
            {company.description && (
              <p className="text-gray-700 mt-2 line-clamp-3 text-sm">{company.description}</p>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}

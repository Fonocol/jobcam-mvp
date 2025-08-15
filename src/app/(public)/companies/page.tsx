// /app/(public)/companies/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Entreprises partenaires</h1>
      
      <div className="grid md:grid-cols-2 gap-4">
        {companies.map((company) => (
          <Link 
            key={company.id} 
            href={`/companies/${company.id}`}
            className="border p-4 rounded-lg hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-semibold">{company.name}</h2>
            <p className="text-gray-600 text-sm mt-1">{company.region}</p>
            <p className="text-gray-700 mt-2 line-clamp-2">{company.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
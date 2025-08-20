import CompanyBanner from "@/components/CompanyBanner";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CompanyPage({ params }: { params: { id: string } }) {
  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      jobs: {
        select: {
          id: true,
          title: true,
          type: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });

  if (!company) return <div>Entreprise non trouvée</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-8">
        {/* Réutilisez le même composant de bannière */}
        <CompanyBanner company={company} />
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4">Offres récentes</h2>
        {company.jobs.length > 0 ? (
          <div className="space-y-3">
            {company.jobs.map(job => (
              <Link 
                key={job.id} 
                href={`/jobs/${job.id}`}
                className="block p-3 border rounded hover:bg-gray-50"
              >
                <h3 className="font-medium">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.type}</p>
              </Link>
            ))}
             <Link href={`/companies/${company.id}/jobs`} className="text-blue-600 hover:underline">
              Voir toutes les offres →
              </Link>
          </div>
         

        ) : (
          <p>Aucune offre disponible</p>
        )}
      </section>
    </div>
  );
}



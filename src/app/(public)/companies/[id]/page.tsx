import { prisma } from "@/lib/prisma";

export default async function CompanyPage({ params }: { params: { id: string } }) {
  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      jobs: true,
      recruiters: { include: { User: true } }
    }
  });

  if (!company) return <div>Entreprise non trouvée</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{company.name}</h1>
      <p className="text-gray-600">{company.region}</p>
      <p className="mt-4">{company.description}</p>

      <h2 className="text-xl font-bold mt-8">Offres disponibles</h2>
      <ul className="mt-4 space-y-2">
        {company.jobs.map((job) => (
          <li key={job.id} className="border p-3 rounded">
            <a href={`/jobs/${job.id}`} className="font-semibold hover:underline">
              {job.title} ({job.type})
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
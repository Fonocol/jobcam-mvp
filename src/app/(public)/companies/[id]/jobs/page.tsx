// src/app/(public)/companies/[id]/jobs/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale/fr";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined } | undefined>;
};

export default async function CompanyJobsPage({ params, searchParams }: Props) {
  const { id: companyId } = await params;
  const sp = (await searchParams) ?? {};
  const pageSize = 10;

  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, pageParam ? parseInt(pageParam as string, 10) || 1 : 1);

  const [totalJobs, jobs] = await Promise.all([
    prisma.job.count({ where: { companyId } }),
    prisma.job.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
        region: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalJobs / pageSize));

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Toutes les offres</h1>
        <p className="text-sm text-gray-600">Page {page} / {totalPages} — {totalJobs} offres</p>
      </header>

      <main>
        {jobs.length === 0 ? (
          <p>Aucune offre trouvée pour cette page.</p>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block p-4 border rounded hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-medium">{job.title}</h2>
                    <p className="text-sm text-gray-600">{job.type} · {job.region ?? '—'}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: fr })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <nav className="mt-6 flex items-center justify-between">
          <div>
            {page > 1 ? (
              <Link href={`/companies/${companyId}/jobs?page=${page - 1}`} className="px-3 py-1 border rounded hover:bg-gray-100">← Précédent</Link>
            ) : (
              <span className="px-3 py-1 text-gray-400">← Précédent</span>
            )}
          </div>

          <div className="text-sm text-gray-600">Page {page} / {totalPages}</div>

          <div>
            {page < totalPages ? (
              <Link href={`/companies/${companyId}/jobs?page=${page + 1}`} className="px-3 py-1 border rounded hover:bg-gray-100">Suivant →</Link>
            ) : (
              <span className="px-3 py-1 text-gray-400">Suivant →</span>
            )}
          </div>
        </nav>
      </main>

      <div className="mt-6">
        <Link href={`/companies/${companyId}`} className="text-sm text-blue-600 hover:underline">← Retour à l&apos;entreprise</Link>
      </div>
    </div>
  );
}

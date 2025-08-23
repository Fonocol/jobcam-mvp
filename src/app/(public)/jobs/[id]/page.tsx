import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ApplyButton from "./ApplyButton";
import DeleteJobButton from "./DeleteJobButton";

// ---------- Server Action: delete ----------
export async function deleteJobAction(formData: FormData) {
  "use server";

  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== "RECRUITER") {
    redirect("/"); // pas autorisé
  }

  const jobId = formData.get("jobId")?.toString();
  if (!jobId) redirect("/");

  // Récupération du job + postedBy + company
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      postedBy: true,
      Company: {
        select: {
          id: true,
          recruiters: { select: { id: true, userId: true, roleInCompany: true } },
        },
      },
    },
  });

  if (!job) redirect("/");

  // Profil recruteur courant
  const currentRecruiter = await prisma.recruiter.findUnique({
    where: { userId: session.user.id },
    select: { id: true, roleInCompany: true },
  });
  if (!currentRecruiter) redirect("/");

  const isOwner = job.postedById === currentRecruiter.id;
  const isCompanyManager = currentRecruiter.roleInCompany === "COMPANY_MANAGER";

  if (!isOwner && !isCompanyManager) {
    redirect(`/jobs/${job.id}`); // pas les droits
  }

  // Supprimer l’offre (cascade supprime les applications)
  await prisma.job.delete({ where: { id: job.id } });

  // Retour vers le dashboard recruteur
  redirect("/dashboard");
}

// ---------- Page ----------
type Props = { params: Promise<{ id: string }> };

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authConfig);

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      Company: true,
      postedBy: { include: { User: true } },
      _count: { select: { applications: true } },
    },
  });

  if (!job) {
    return <div className="p-4">Offre non trouvée</div>;
  }

  // CANDIDATE → a-t-il déjà postulé ?
  let hasApplied = false;
  if (session?.user?.role === "CANDIDATE") {
    const application = await prisma.application.findFirst({
      where: { jobId: id, candidateId: session.user.candidateId ?? undefined },
      select: { id: true },
    });
    hasApplied = !!application;
  }

  // RECRUITER → profil & droits
  let currentRecruiter: { id: string; roleInCompany?: string } | null = null;
  if (session?.user?.role === "RECRUITER") {
    currentRecruiter = await prisma.recruiter.findUnique({
      where: { userId: session.user.id },
      select: { id: true, roleInCompany: true },
    });
  }

  const isOwner =
    session?.user?.role === "RECRUITER" &&
    currentRecruiter?.id &&
    job.postedById === currentRecruiter.id;

  const isCompanyManager =
    session?.user?.role === "RECRUITER" &&
    currentRecruiter?.roleInCompany === "COMPANY_MANAGER";

  const canEdit = !!(isOwner || isCompanyManager);

  // Présentations
  const salary =
    job.salaryMin && job.salaryMax
      ? `${job.salaryMin.toLocaleString("fr-FR")} - ${job.salaryMax.toLocaleString(
          "fr-FR"
        )} ${job.currency ?? ""}`
      : job.salaryMin
      ? `${job.salaryMin.toLocaleString("fr-FR")} ${job.currency ?? ""}`
      : "Non renseigné";

  const postedDate = job.publishedAt
    ? format(new Date(job.publishedAt), "d MMMM yyyy", { locale: fr })
    : null;

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold leading-tight">{job.title}</h1>
            <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-2 items-center">
              <span>{job.Company?.name}</span>
              {job.region && <span>• {job.region}</span>}
              {job.city && <span>• {job.city}</span>}
              {job.type && <span className="px-2 py-0.5 rounded bg-gray-100">{job.type}</span>}
              {job.remoteType && (
                <span className="px-2 py-0.5 rounded bg-gray-100">{job.remoteType}</span>
              )}
            </div>

            <div className="mt-3 text-sm text-gray-700">
              <strong>Salaire:</strong> {salary}
              <span className="mx-2">•</span>
              <strong>Statut:</strong> {job.status}
              {postedDate && (
                <>
                  <span className="mx-2">•</span>
                  <span>Publié le {postedDate}</span>
                </>
              )}
            </div>

            {job.tags?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {job.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-sky-50 px-2 py-1 rounded-full border border-sky-100 text-sky-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Actions à droite */}
          <div className="flex-shrink-0 flex flex-col items-end gap-3">
            <div className="text-sm text-gray-600 text-right">
              <div>{job._count?.applications ?? 0} candidature(s)</div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              {/* Candidat */}
              {session?.user?.role === "CANDIDATE" && (
                <ApplyButton jobId={job.id} isRecruiter={false} hasApplied={hasApplied} />
              )}

              {/* Recruteur */}
              {session?.user?.role === "RECRUITER" && (
                <>
                  {/* Lien candidatures visible seulement si owner/manager */}
                  {canEdit && (
                    <Link
                      href={`/recruiter-jobs/${job.id}/applications`}
                      className="inline-flex items-center px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:opacity-95"
                    >
                      Voir les candidatures ({job._count?.applications ?? 0})
                    </Link>
                  )}

                  {/* Toujours possible de dupliquer pour repartir d’un modèle */}
                  <Link
                    href={`/recruiter-jobs/new?companyId=${job.companyId}&jobId=${job.id}`}
                    className="inline-flex items-center px-3 py-2 rounded-md border text-sm text-gray-700 hover:bg-gray-50"
                  >
                    + Nouvelle offre
                  </Link>

                  {/* Modifier + Supprimer uniquement si owner/manager */}
                  {canEdit && (
                    <>
                      <Link
                        href={`/recruiter-jobs/${job.id}/edit`}
                        className="inline-flex items-center px-3 py-2 rounded-md bg-sky-600 text-white text-sm hover:opacity-95"
                      >
                        Modifier
                      </Link>

                      <form action={deleteJobAction}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <DeleteJobButton />
                      </form>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </header>

        <hr className="my-6" />

        {/* Description */}
        <section className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: job.description }} />
        </section>

        {/* Responsibilities / Requirements */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {job.responsibilities && (
            <div>
              <h3 className="font-semibold mb-2">Responsabilités</h3>
              <p className="text-sm text-gray-700">{job.responsibilities}</p>
            </div>
          )}
          {job.requirements && (
            <div>
              <h3 className="font-semibold mb-2">Exigences</h3>
              <p className="text-sm text-gray-700">{job.requirements}</p>
            </div>
          )}
        </div>

        <hr className="my-6" />

        {/* Posted by */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-700">
              {job.postedBy?.User?.name
                ? job.postedBy.User.name
                    .split(" ")
                    .map((s: string) => s[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : job.postedBy?.title?.slice(0, 2).toUpperCase() ?? "HR"}
            </div>

            <div>
              <div className="text-sm font-medium">
                {job.postedBy?.User?.name ?? job.postedBy?.title ?? "Recruteur"}
              </div>
              <div className="text-xs text-gray-500">
                {job.postedBy?.title
                  ? `${job.postedBy.title}`
                  : "Membre de l'équipe recrutement"}
                {job.postedBy?.User?.email && (
                  <span className="ml-2">• {job.postedBy.User.email}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session?.user?.role === "CANDIDATE" && job.postedBy?.User?.email && (
              <a
                href={`mailto:${job.postedBy.User.email}?subject=Candidature%20pour%20${encodeURIComponent(
                  job.title
                )}`}
                className="text-sm inline-flex items-center px-3 py-2 border rounded-md hover:bg-gray-50"
              >
                Contacter le recruteur
              </a>
            )}

            <Link
              href={`/companies/${job.Company?.id}`}
              className="text-sm inline-flex items-center px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-50"
            >
              Voir l'entreprise
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

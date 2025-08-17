import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import ApplicationStatusBadge from "../../ApplicationStatusBadge";
import Link from "next/link";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; 
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== "CANDIDATE") redirect("/");

  const application = await prisma.application.findUnique({
    where: { 
      id: id,
      candidateId: session.user.candidateId 
    },
    include: {
      Job: {
        include: {
          Company: true
        }
      }
    }
  });

  if (!application) redirect("/candidate-dashboard");

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/candidate-dashboard" 
          className="text-blue-500 hover:underline"
        >
          &larr; Retour à mes candidatures
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">Détails de ma candidature</h1>
      
      <div className="bg-white border rounded-lg p-6">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="font-bold text-lg mb-2">Poste</h2>
            <p>{application.Job.title}</p>
            <p className="text-gray-600">{application.Job.type}</p>
          </div>
          <div>
            <h2 className="font-bold text-lg mb-2">Entreprise</h2>
            <p>{application.Job.Company.name}</p>
            <p className="text-gray-600">{application.Job.Company.region}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-bold text-lg mb-2">Statut</h2>
          <ApplicationStatusBadge status={application.status} />
        </div>

        {application.message && (
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2">Message accompagnant ma candidature</h2>
            <p className="whitespace-pre-line">{application.message}</p>
          </div>
        )}

        <div>
          <h2 className="font-bold text-lg mb-2">CV envoyé</h2>
          <a
            href={application.cvUrl!}
            target="_blank"
            className="text-blue-500 hover:underline"
          >
            Voir mon CV
          </a>
        </div>
      </div>
    </div>
  );
}
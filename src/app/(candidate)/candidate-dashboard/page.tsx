import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import ApplicationStatusBadge from "./ApplicationStatusBadge";
import Link from "next/link";

export default async function CandidateDashboard() {
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== "CANDIDATE") redirect("/");

  const applications = await prisma.application.findMany({
    where: { candidateId: session.user.candidateId },
    include: {
      Job: {
        include: {
          Company: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mes candidatures</h1>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Poste</th>
              <th className="p-3 text-left">Entreprise</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <Link 
                    href={`/jobs/${app.Job.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    {app.Job.title}
                  </Link>
                </td>
                <td className="p-3">{app.Job.Company.name}</td>
                <td className="p-3">
                  {new Date(app.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <ApplicationStatusBadge status={app.status} />
                </td>
                <td className="p-3">
                  <Link
                    href={`/candidate-dashboard/applications/${app.id}`}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Détails
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


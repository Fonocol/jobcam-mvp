"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function JobTable({ jobs }: {
  jobs: Array<{
    id: string;
    title: string | null;
    type: string | null;
    createdAt: Date;
    _count: { applications: number };
  }>
}) {
  const router = useRouter();

  const handleDelete = async (jobId: string) => {
    if (confirm("Supprimer cette offre ?")) {

        await fetch(`/api/jobs`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: jobId })
        });
        router.refresh();
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Titre</th>
            <th className="p-3 text-left">Type</th>
            <th className="p-3 text-left">Candidatures</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.id} className="border-t hover:bg-gray-50">

              <td className="p-3">
                <Link
                  href={`/jobs/${job.id}`}
                  className="text-sm text-blue-500 hover:underline"
                >
                  {job.title}
                </Link>
              </td>

              <td className="p-3">{job.type}</td>
              <td className="p-3">
                <Link 
                  href={`/recruiter-jobs/${job.id}/applications`}
                  className="text-blue-500 hover:underline"
                >
                  {job._count.applications}
                </Link>
              </td>
              <td className="p-3">
                {new Date(job.createdAt).toLocaleDateString()}
              </td>
              <td className="p-3 flex gap-2">
                <Link
                  href={`/recruiter-jobs/${job.id}/edit`}
                  className="text-sm text-blue-500 hover:underline"
                >
                  Modifier
                </Link>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
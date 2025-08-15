"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function JobDetailPage() {
  const params = useParams();
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/jobs?id=${params.id}`)
      .then((res) => res.json())
      .then((data) => setJob(data[0]))
      .catch(console.error);
  }, [params.id]);

  if (!job) return <p>Chargement...</p>;

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">{job.title}</h1>
      <p>{job.Company?.name} – {job.region} ({job.type})</p>
      <p className="mt-4">{job.description}</p>

      <a
        href={`/jobs/${job.id}/apply`}
        className="inline-block mt-6 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Postuler
      </a>
    </main>
  );
}

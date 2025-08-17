"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
<main className="p-4">
  <h1 className="text-2xl font-bold mb-6">Offres d'emploi</h1>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {jobs.map((job) => (
      <div key={job.id} className="border p-4 rounded">
        <h2 className="font-semibold">{job.title}</h2>

        <div className="text-sm text-gray-600 mt-1 flex items-center gap-2 flex-wrap">
          <Link 
            href={`/companies/${job.companyId}`}
            className="text-blue-500 hover:underline"
          >
            {job.Company?.name}
          </Link>
          <span>•</span>
          <span>{job.region}</span>
          <span>•</span>
          <span>{job.type}</span>
        </div>

        <div className="mt-3 flex justify-between text-sm">
          <Link href={`/jobs/${job.id}`} className="text-blue-500">Voir détails</Link>

        </div>
      </div>
    ))}
  </div>
</main>

  );

 }
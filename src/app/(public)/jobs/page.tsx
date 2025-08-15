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
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Offres d'emploi</h1>
      
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="border p-4 rounded-lg hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-gray-600">
              {job.Company?.name} • {job.region} • {job.type}
            </p>
            <div className="mt-3 flex justify-between items-center">
              <Link 
                href={`/jobs/${job.id}`} 
                className="text-blue-500 hover:underline"
              >
                Voir détails
              </Link>
              <Link
                href={`/jobs/${job.id}/apply`}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              >
                Postuler
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
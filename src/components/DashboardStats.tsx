"use client";

export default function DashboardStats({
  jobCount,
  applicationCount
}: {
  jobCount: number;
  applicationCount: number;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      <div className="border p-4 rounded-lg bg-white">
        <h3 className="text-gray-500">Offres actives</h3>
        <p className="text-3xl font-bold">{jobCount}</p>
      </div>
      <div className="border p-4 rounded-lg bg-white">
        <h3 className="text-gray-500">Candidatures totales</h3>
        <p className="text-3xl font-bold">{applicationCount}</p>
      </div>
    </div>
  );
}
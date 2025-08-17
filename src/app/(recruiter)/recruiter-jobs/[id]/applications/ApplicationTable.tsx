"use client";

import Link from "next/link";

export default function ApplicationTable({ applications }: {
  applications: Array<{
    id: string;
    message: string;
    cvUrl: string;
    Candidate: {
      User: {
        name: string;
        email: string;
      };
    };
  }>
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Candidat</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Message</th>
            <th className="p-3 text-left">CV</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{app.Candidate.User.name}</td>
              <td className="p-3">{app.Candidate.User.email}</td>
              <td className="p-3 max-w-xs truncate">{app.message}</td>
              <td className="p-3">
                {app.cvUrl && (
                  <a
                    href={app.cvUrl}
                    target="_blank"
                    className="text-blue-500 hover:underline"
                  >
                    Voir CV
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
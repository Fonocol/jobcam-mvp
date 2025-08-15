import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export default async function CompanyPage() {
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== "RECRUITER") redirect("/");

  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: session.user.id },
    include: { company: true }
  });

  // Si pas d'entreprise, rediriger vers la création
  if (!recruiter?.company) redirect("/company/new");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Mon entreprise</h1>
      <div className="mt-4 p-4 border rounded">
        <h2 className="font-semibold">{recruiter.company.name}</h2>
        <p className="text-gray-600">{recruiter.company.region}</p>
        <p className="mt-2">{recruiter.company.description}</p>
        <a 
          href="/company/edit" 
          className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded"
        >
          Modifier
        </a>
      </div>
    </div>
  );
}
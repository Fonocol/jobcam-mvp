import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import DashboardStats from "@/components/DashboardStats";
import JobTable from "@/components/JobTable";

export default async function RecruiterDashboard() {
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== "RECRUITER") redirect("/");

  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: session.user.id },
    include: {
      company: {
        include: {
          jobs: {
            include: {
              _count: {
                select: { applications: true }
              }
            },
            orderBy: { createdAt: "desc" }
          }
        }
      }
    }
  });

  if (!recruiter?.company) redirect("/company/new");

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      
      <DashboardStats 
        jobCount={recruiter.company.jobs.length} 
        applicationCount={recruiter.company.jobs.reduce(
          (sum, job) => sum + job._count.applications, 0
        )} 
      />
      
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Vos offres d'emploi</h2>
          <a
            href="/recruiter-jobs/new"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            + Nouvelle offre
          </a>
        </div>
        
        <JobTable jobs={recruiter.company.jobs} />
      </div>
    </div>
  );
}
// src/app/jobs/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import ApplyButton from "./ApplyButton";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; 
  const session = await getServerSession(authConfig);
  const job = await prisma.job.findUnique({
    where: { id: id },
    include: { Company: true },
  });

  if (!job) {
    return <div>Offre non trouvée</div>;
  }

  let hasApplied = false;
  if (session?.user?.role === "CANDIDATE") {
    const application = await prisma.application.findFirst({
      where: {
        jobId: id,
        candidateId: session.user.candidateId,
      },
    });
    hasApplied = !!application;
  }

  const isRecruiter = session?.user?.role === "RECRUITER";

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">{job.title}</h1>
      <p className="text-gray-600">
        {job.Company?.name} • {job.region} • {job.type}
      </p>
      <div className="mt-6 prose" dangerouslySetInnerHTML={{ __html: job.description }} />

      <ApplyButton 
        jobId={job.id}
        isRecruiter={isRecruiter}
        hasApplied={hasApplied}
      />
    </main>
  );
}
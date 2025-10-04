// src/app/(public)/jobs/[id]/actions.ts
"use server";

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";

// ---------- Server Action: delete ----------
export async function deleteJobAction(formData: FormData) {

  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== "RECRUITER") {
    redirect("/"); // pas autorisé
  }

  const jobId = formData.get("jobId")?.toString();
  if (!jobId) redirect("/");

  // Récupération du job + postedBy + company
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      postedBy: true,
      Company: {
        select: {
          id: true,
          recruiters: { select: { id: true, userId: true, roleInCompany: true } },
        },
      },
    },
  });

  if (!job) redirect("/");

  // Profil recruteur courant
  const currentRecruiter = await prisma.recruiter.findUnique({
    where: { userId: session.user.id },
    select: { id: true, roleInCompany: true },
  });
  if (!currentRecruiter) redirect("/");

  const isOwner = job.postedById === currentRecruiter.id;
  const isCompanyManager = currentRecruiter.roleInCompany === "COMPANY_MANAGER";

  if (!isOwner && !isCompanyManager) {
    redirect(`/jobs/${job.id}`); // pas les droits
  }

  // Supprimer l’offre (cascade supprime les applications)
  await prisma.job.delete({ where: { id: job.id } });

  // Retour vers le dashboard recruteur
  redirect("/dashboard");
}

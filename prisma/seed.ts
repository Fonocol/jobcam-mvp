import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash("test1234", 10);

  const company = await prisma.company.create({
    data: { name: "CamTech", description: "Startup à Douala", region: "Littoral" }
  });

  const recruiterUser = await prisma.user.create({
    data: { email: "recruteur@camtech.cm", password: pass, name: "HR CamTech", role: "RECRUITER",
      recruiter: { create: { companyId: company.id } } }
  });

  const candidateUser = await prisma.user.create({
    data: { email: "candidat@demo.cm", password: pass, name: "Alice", role: "CANDIDATE",
      candidate: { create: { headline: "Dév junior", location: "Yaoundé" } } }
  });

  await prisma.job.create({
    data: { title: "Développeur Frontend", companyId: company.id, region: "Centre", type: "CDI",
            description: "React, Tailwind, bonne base JS." }
  });
}
main().finally(()=>prisma.$disconnect());

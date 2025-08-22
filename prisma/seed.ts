// prisma/seed.ts
import { PrismaClient, Role, JobType, ApplicationStatus, RemoteType, JobStatus, Currency } from "@prisma/client";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// ----------------------
// Paramètres (ajuste si besoin)
const PASSWORD_PLAINTEXT = "test1234";
const NUM_COMPANIES = 12;
const NUM_RECRUITERS = 40;
const NUM_CANDIDATES = 200;
const NUM_JOBS = 300;
const MIN_APPS_PER_CANDIDATE = 1;
const MAX_APPS_PER_CANDIDATE = 4;
const REGIONS = [
  "Centre",
  "Littoral",
  "Ouest",
  "Nord",
  "Extrême-Nord",
  "Sud",
  "Est",
  "Adamaoua",
  "Télétravail",
];
// ----------------------

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  console.time("seed_total");
  faker.seed(42);
  const passwordHash = await bcrypt.hash(PASSWORD_PLAINTEXT, 10);

  // Cleanup (ordre FK)
  console.log("🧹 Cleaning DB…");
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.companyFollow.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.recruiter.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // 1) Companies
  console.log(`🏢 Creating ${NUM_COMPANIES} companies…`);
  const companies = [];
  for (let i = 0; i < NUM_COMPANIES; i++) {
    const name = faker.company.name() + (i % 3 === 0 ? " SARL" : "");
    const c = await prisma.company.create({
      data: {
        name,
        slug: `${slugify(name)}-${faker.string.alphanumeric(4)}`,
        description: faker.company.catchPhrase(),
        region: faker.helpers.arrayElement(REGIONS),
        city: faker.location.city(),
        website: faker.internet.url(),
        industry: faker.commerce.department(),
        size: faker.helpers.arrayElement(["1-10", "11-50", "51-200", "200+"]),
        verified: faker.datatype.boolean(),
      },
    });
    companies.push(c);
  }

  // 2) Recruiters (create user + recruiter) and map company -> recruiters
  console.log(`🧑‍💼 Creating ${NUM_RECRUITERS} recruiters and users…`);
  const companyToRecruiters: Record<string, { userId: string; recruiterId: string }[]> = {};
  for (let i = 0; i < NUM_RECRUITERS; i++) {
    const company = faker.helpers.arrayElement(companies);
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        password: passwordHash,
        name: faker.person.fullName(),
        role: Role.RECRUITER,
        recruiter: {
          create: {
            companyId: company.id,
            title: faker.person.jobTitle(),
          },
        },
      },
      include: { recruiter: true },
    });

    const recInfo = { userId: user.id, recruiterId: user.recruiter!.id };
    if (!companyToRecruiters[company.id]) companyToRecruiters[company.id] = [];
    companyToRecruiters[company.id].push(recInfo);
  }

  // 2bis) add a few fixed recruiters (dev login)
  const fixed1 = await prisma.user.create({
    data: {
      email: "hr@kiroo.cm",
      password: passwordHash,
      name: "Emmanuel Mba",
      role: Role.RECRUITER,
      recruiter: { create: { companyId: companies[0].id, title: "HR Manager" } },
    },
    include: { recruiter: true },
  });
  companyToRecruiters[companies[0].id].push({ userId: fixed1.id, recruiterId: fixed1.recruiter!.id });

  const fixed2 = await prisma.user.create({
    data: {
      email: "recrutement@jangolo.cm",
      password: passwordHash,
      name: "Aïcha Diallo",
      role: Role.RECRUITER,
      recruiter: { create: { companyId: companies[1].id, title: "Talent Lead" } },
    },
    include: { recruiter: true },
  });
  companyToRecruiters[companies[1].id].push({ userId: fixed2.id, recruiterId: fixed2.recruiter!.id });

  // 3) Candidates (users + candidate) + experiences & educations
  console.log(`🧑‍🎓 Creating ${NUM_CANDIDATES} candidates…`);
  const candidates: { id: string; resumeUrl?: string | null }[] = [];
  for (let i = 0; i < NUM_CANDIDATES; i++) {
    const email = faker.internet.email().toLowerCase();
    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: faker.person.fullName(),
        role: Role.CANDIDATE,
        candidate: {
          create: {
            headline: faker.person.jobTitle(),
            bio: faker.lorem.paragraph(),
            locationCity: faker.location.city(),
            locationCountry: "Cameroun",
            resumeUrl: faker.internet.url(),
            skills: faker.helpers.arrayElements(["JavaScript", "Python", "React", "Node.js", "SQL", "Design", "DevOps", "UI/UX"], { min: 2, max: 5 }),
            links: { linkedin: faker.internet.url(), website: faker.internet.url() },
          },
        },
      },
      include: { candidate: true },
    });

    // experiences
    const expCount = faker.number.int({ min: 0, max: 3 });
    for (let e = 0; e < expCount; e++) {
      await prisma.experience.create({
        data: {
          candidateId: user.candidate!.id,
          title: faker.person.jobTitle(),
          company: faker.company.name(),
          startDate: faker.date.past({ years: 5 }),
          endDate: faker.datatype.boolean() ? faker.date.recent({ days: 30 }) : null,
          description: faker.lorem.sentences(2),
        },
      });
    }

    // educations
    const eduCount = faker.number.int({ min: 0, max: 2 });
    for (let ed = 0; ed < eduCount; ed++) {
      await prisma.education.create({
        data: {
          candidateId: user.candidate!.id,
          school: faker.company.name() + " University",
          degree: faker.helpers.arrayElement(["Licence", "Master", "Certificat"]),
          field: faker.helpers.arrayElement(["Informatique", "Design", "Finance", "Marketing"]),
          startDate: faker.date.past({ years: 6 }),
          endDate: faker.datatype.boolean() ? faker.date.past({ years: 1 }) : null,
        },
      });
    }

    candidates.push({ id: user.candidate!.id, resumeUrl: user.candidate!.resumeUrl ?? null });
  }

  // 4) Jobs (création + assign postedById si recruteur dispo pour cette company)
  console.log(`📄 Creating ${NUM_JOBS} jobs…`);
  const jobs = [];
  for (let i = 0; i < NUM_JOBS; i++) {
    const company = faker.helpers.arrayElement(companies);
    const title = faker.person.jobTitle();
    // choose a recruiter for this company if any
    const recs = companyToRecruiters[company.id] ?? [];
    const pickedRec = recs.length > 0 ? faker.helpers.arrayElement(recs) : null;

    const j = await prisma.job.create({
      data: {
        title,
        slug: `${slugify(title)}-${faker.string.alphanumeric(4)}`,
        companyId: company.id,
        postedById: pickedRec!.recruiterId,
        region: faker.helpers.arrayElement(REGIONS),
        city: faker.location.city(),
        type: faker.helpers.arrayElement(Object.values(JobType)),
        remoteType: faker.helpers.arrayElement(Object.values(RemoteType)),
        description: faker.lorem.paragraphs({ min: 1, max: 2 }),
        requirements: faker.lorem.sentences({ min: 1, max: 3 }),
        responsibilities: faker.lorem.sentences({ min: 1, max: 3 }),
        status: JobStatus.PUBLISHED,
        salaryMin: faker.number.int({ min: 150000, max: 400000 }),
        salaryMax: faker.number.int({ min: 400001, max: 1200000 }),
        currency: Currency.XAF,
        publishedAt: new Date(),
        tags: faker.helpers.arrayElements(["Remote", "Agile", "FinTech", "AI", "Cloud", "HealthTech"], { min: 1, max: 3 }),
      },
    });
    jobs.push(j);
  }

  // 5) CompanyFollow (quelques follows aléatoires pour tester)
  console.log("⭐ Creating random company follows...");
  const followOps = [];
  for (const comp of companies) {
    // pick few candidates to follow this company
    const toFollow = faker.helpers.arrayElements(candidates, faker.number.int({ min: 0, max: 6 }));
    for (const f of toFollow) {
      followOps.push(
        prisma.companyFollow.create({
          data: { companyId: comp.id, candidateId: f.id },
        })
      );
    }
  }
  // execute in smaller batches
  for (let i = 0; i < followOps.length; i += 50) {
    await prisma.$transaction(followOps.slice(i, i + 50));
  }

  // 6) Applications (éviter duplications : utiliser Set)
  console.log("📨 Creating applications...");
  const appRows: { jobId: string; candidateId: string; message: string; cvUrl?: string; status: ApplicationStatus }[] = [];
  const jobIds = jobs.map(j => j.id);

  for (const cand of candidates) {
    const appCount = faker.number.int({ min: MIN_APPS_PER_CANDIDATE, max: MAX_APPS_PER_CANDIDATE });
    const picked = faker.helpers.arrayElements(jobIds, appCount);

    const seen = new Set<string>();
    for (const jobId of picked) {
      if (seen.has(`${cand.id}:${jobId}`)) continue;
      seen.add(`${cand.id}:${jobId}`);
      appRows.push({
        jobId,
        candidateId: cand.id,
        message: faker.lorem.sentences({ min: 1, max: 2 }),
        cvUrl: cand.resumeUrl ?? faker.internet.url(),
        status: faker.helpers.arrayElement(Object.values(ApplicationStatus)),
      });
    }
  }

  // insert applications in batches
  for (let i = 0; i < appRows.length; i += 1000) {
    const batch = appRows.slice(i, i + 1000);
    await prisma.application.createMany({ data: batch });
    if ((i / 1000) % 5 === 0) console.log(`  → inserted ${Math.min(i + 1000, appRows.length)} / ${appRows.length}`);
  }

  console.log("✅ Seed terminé !");
  console.table({
    Companies: companies.length,
    Recruiters: Object.values(companyToRecruiters).flat().length,
    Candidates: candidates.length,
    Jobs: jobs.length,
    Applications: appRows.length,
  });

  console.timeEnd("seed_total");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

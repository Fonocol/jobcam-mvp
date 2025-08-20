// prisma/seed.ts
// @ts-ignore - Ignorer l'erreur TypeScript temporairement

// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

// @ts-ignore
const prisma = new PrismaClient();

// ----------------------
// Paramètres (ajuste librement)
// ----------------------
const PASSWORD_PLAINTEXT = "test1234";
const NUM_COMPANIES = 15;
const NUM_RECRUITERS = 40;
const NUM_CANDIDATES = 400;
const NUM_JOBS = 1200;

// Chaque candidat postulera entre 1 et 5 offres
const MIN_APPS_PER_CANDIDATE = 1;
const MAX_APPS_PER_CANDIDATE = 5;

// Traitement en paquets pour aller plus vite sans saturer la DB
const CHUNK_SIZE = 50;

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
const JOB_TYPES = ["CDI", "CDD", "Stage", "Freelance", "Alternance"];
const APP_STATUSES = ["PENDING", "REVIEW", "ACCEPTED", "REJECTED"];

// ----------------------
function chunk<T>(arr: T[], size = CHUNK_SIZE): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  console.time("seed_total");
  faker.seed(42);

  const passwordHash = await bcrypt.hash(PASSWORD_PLAINTEXT, 10);

  // 1) Nettoyage (respecter l'ordre des FK)
  console.log("🧹 Cleaning DB…");
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.recruiter.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // 2) Companies
  console.log(`🏢 Creating ${NUM_COMPANIES} companies…`);
  const companies: { id: string }[] = [];
  for (const batch of chunk(Array.from({ length: NUM_COMPANIES }))) {
    const created = await prisma.$transaction(
      batch.map(() =>
        prisma.company.create({
          data: {
            name: faker.company.name(),
            description: faker.lorem.paragraph(),
            region: faker.helpers.arrayElement(REGIONS),
          },
          select: { id: true },
        })
      )
    );
    companies.push(...created);
  }

  // 3) Recruiters (Users avec recruiter + company)
  console.log(`🧑‍💼 Creating ${NUM_RECRUITERS} recruiters…`);
  const recruiters: { id: string; userId: string; companyId: string }[] = [];
  for (const batch of chunk(Array.from({ length: NUM_RECRUITERS }))) {
    const created = await prisma.$transaction(
      batch.map(() => {
        const company = faker.helpers.arrayElement(companies);
        return prisma.user.create({
          data: {
            email: faker.internet.email().toLowerCase(),
            password: passwordHash,
            name: faker.person.fullName(),
            role: "RECRUITER",
            recruiter: {
              create: { companyId: company.id },
            },
          },
          select: {
            id: true,
            recruiter: { select: { id: true, companyId: true } },
          },
        });
      })
    );

    for (const u of created) {
      recruiters.push({
        id: u.recruiter!.id,
        userId: u.id,
        companyId: u.recruiter!.companyId!,
      });
    }
  }

  // 3bis) Ajout de 2-3 recruteurs fixes (optionnel pour te loguer côté UI)
  await prisma.user.create({
    data: {
      email: "hr@kiroo.cm",
      password: passwordHash,
      name: "Emmanuel Mba",
      role: "RECRUITER",
      recruiter: { create: { companyId: companies[0].id } },
    },
  });
  await prisma.user.create({
    data: {
      email: "recrutement@jangolo.cm",
      password: passwordHash,
      name: "Aïcha Diallo",
      role: "RECRUITER",
      recruiter: { create: { companyId: companies[1].id } },
    },
  });

  // 4) Candidates (Users avec candidate)
  console.log(`🧑‍🎓 Creating ${NUM_CANDIDATES} candidates…`);
  type CandidateRow = { id: string; userId: string; resumeUrl: string | null };
  const candidates: CandidateRow[] = [];
  for (const batch of chunk(Array.from({ length: NUM_CANDIDATES }))) {
    const created = await prisma.$transaction(
      batch.map(() =>
        prisma.user.create({
          data: {
            email: faker.internet.email().toLowerCase(),
            password: passwordHash,
            name: faker.person.fullName(),
            role: "CANDIDATE",
            candidate: {
              create: {
                headline: faker.person.jobTitle(),
                location: faker.location.city(),
                resumeUrl: faker.internet.url(),
              },
            },
          },
          select: {
            id: true,
            candidate: { select: { id: true, resumeUrl: true } },
          },
        })
      )
    );

    for (const u of created) {
      candidates.push({
        id: u.candidate!.id,
        userId: u.id,
        resumeUrl: u.candidate!.resumeUrl ?? null,
      });
    }
  }

  // 4bis) Candidats fixes (optionnel, pour test UI rapide)
  const fixedCands = await prisma.$transaction([
    prisma.user.create({
      data: {
        email: "jean.kamdem@yahoo.fr",
        password: passwordHash,
        name: "Jean Kamdem",
        role: "CANDIDATE",
        candidate: {
          create: {
            headline: "Développeur Fullstack",
            location: "Douala",
            resumeUrl: faker.internet.url(),
          },
        },
      },
      select: { candidate: { select: { id: true, resumeUrl: true } } },
    }),
    prisma.user.create({
      data: {
        email: "aicha.mohamadou@gmail.com",
        password: passwordHash,
        name: "Aïcha Mohamadou",
        role: "CANDIDATE",
        candidate: {
          create: {
            headline: "Designer UI/UX",
            location: "Yaoundé",
            resumeUrl: faker.internet.url(),
          },
        },
      },
      select: { candidate: { select: { id: true, resumeUrl: true } } },
    }),
  ]);
  candidates.push(
    { id: fixedCands[0].candidate!.id, userId: "", resumeUrl: fixedCands[0].candidate!.resumeUrl },
    { id: fixedCands[1].candidate!.id, userId: "", resumeUrl: fixedCands[1].candidate!.resumeUrl }
  );

  // 5) Jobs
  console.log(`📄 Creating ${NUM_JOBS} jobs…`);
  const jobs: { id: string; companyId: string }[] = [];
  for (const batch of chunk(Array.from({ length: NUM_JOBS }))) {
    const created = await prisma.$transaction(
      batch.map(() => {
        const company = faker.helpers.arrayElement(companies);
        return prisma.job.create({
          data: {
            title: faker.person.jobTitle(),
            companyId: company.id,
            region: faker.helpers.arrayElement(REGIONS),
            type: faker.helpers.arrayElement(JOB_TYPES),
            description: faker.lorem.paragraphs({ min: 1, max: 3 }),
          },
          select: { id: true, companyId: true },
        });
      })
    );
    jobs.push(...created);
  }

  // 5bis) Quelques jobs "connus"
  await prisma.$transaction([
    prisma.job.create({
      data: {
        title: "Développeur Unity",
        companyId: companies[0].id,
        region: "Centre",
        type: "CDI",
        description: "Nous recherchons un développeur Unity expérimenté…",
      },
    }),
    prisma.job.create({
      data: {
        title: "Game Designer",
        companyId: companies[0].id,
        region: "Télétravail",
        type: "CDD",
        description: "Conception de mécaniques de jeu innovantes…",
      },
    }),
  ]);

  // 6) Applications (candidatures)
  console.log("📨 Creating applications… (this can take a bit)");
  // Pour éviter les doublons (même candidat postulant 2x au même job), on tracke une clé candidateId|jobId
  const appRows: { jobId: string; candidateId: string; message: string; cvUrl?: string | null; status?: string }[] =
    [];

  for (const cand of candidates) {
    const appCount = faker.number.int({ min: MIN_APPS_PER_CANDIDATE, max: MAX_APPS_PER_CANDIDATE });
    const pickedJobs = faker.helpers.arrayElements(jobs, appCount);

    for (const j of pickedJobs) {
      appRows.push({
        jobId: j.id,
        candidateId: cand.id,
        message: faker.lorem.sentences({ min: 1, max: 2 }),
        cvUrl: cand.resumeUrl || faker.internet.url(),
        status: faker.helpers.arrayElement(APP_STATUSES),
      });
    }
  }

  // insert en paquets
  let inserted = 0;
  for (const part of chunk(appRows, 1000)) {
    // createMany est très rapide ici car on a des IDs existants
    await prisma.application.createMany({ data: part });
    inserted += part.length;
    if (inserted % 5000 === 0) console.log(`  → ${inserted} applications`);
  }

  console.log("✅ Seed OK!");
  console.table({
    Companies: companies.length,
    Recruiters: recruiters.length + 2, // + ceux ajoutés en fixe
    Candidates: candidates.length,
    Jobs: jobs.length + 2,             // + ceux ajoutés en fixe
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

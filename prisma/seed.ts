// prisma/seed.ts
import { PrismaClient, Prisma, Role, JobType, ApplicationStatus, RemoteType, JobStatus, Currency, CompanyRole } from "@prisma/client";
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
const NUM_RESUME_TEMPLATES = 5;
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

// Types pour la structure JSON des CVs
interface ResumeData {
  personal: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    photo?: string;
    summary: string;
    links: {
      linkedin?: string;
      github?: string;
      portfolio?: string;
      twitter?: string;
    };
  };
  experiences: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    skills: string[];
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    category: string;
    level: number;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  languages: Array<{
    id: string;
    name: string;
    level: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    link?: string;
  }>;
}

interface ResumeStyle {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent?: string;
  };
  fonts: {
    headings: string;
    body: string;
  };
  spacing: {
    section: number;
    item: number;
  };
}

// Templates de CV avec structure JSON
const resumeTemplates = [
  {
    name: "Moderne",
    category: "Moderne",
    structure: {
      sections: ["personal", "experience", "education", "skills", "projects"],
      layout: "modern" as const,
    },
    style: {
      colors: {
        primary: "#2563eb",
        secondary: "#64748b",
        background: "#ffffff",
        text: "#1f2937",
        accent: "#f59e0b"
      },
      fonts: {
        headings: "Inter",
        body: "Inter"
      },
      spacing: {
        section: 6,
        item: 4
      }
    },
    isPublic: true,
    isPremium: false
  },
  {
    name: "Classique",
    category: "Classique",
    structure: {
      sections: ["personal", "experience", "education", "skills", "languages"],
      layout: "classic" as const,
    },
    style: {
      colors: {
        primary: "#374151",
        secondary: "#6b7280",
        background: "#ffffff",
        text: "#111827"
      },
      fonts: {
        headings: "Georgia",
        body: "Helvetica"
      },
      spacing: {
        section: 8,
        item: 6
      }
    },
    isPublic: true,
    isPremium: false
  },
  {
    name: "Créatif",
    category: "Créatif",
    structure: {
      sections: ["personal", "skills", "projects", "experience", "education"],
      layout: "creative" as const,
    },
    style: {
      colors: {
        primary: "#7c3aed",
        secondary: "#a78bfa",
        background: "#faf5ff",
        text: "#1f2937"
      },
      fonts: {
        headings: "Poppins",
        body: "Open Sans"
      },
      spacing: {
        section: 4,
        item: 3
      }
    },
    isPublic: true,
    isPremium: true
  },
  {
    name: "Minimaliste",
    category: "Minimaliste",
    structure: {
      sections: ["personal", "experience", "education", "skills"],
      layout: "minimalist" as const,
    },
    style: {
      colors: {
        primary: "#000000",
        secondary: "#666666",
        background: "#ffffff",
        text: "#333333"
      },
      fonts: {
        headings: "Helvetica",
        body: "Helvetica"
      },
      spacing: {
        section: 10,
        item: 8
      }
    },
    isPublic: true,
    isPremium: false
  }
];

async function main() {
  console.time("seed_total");
  faker.seed(42);
  const passwordHash = await bcrypt.hash(PASSWORD_PLAINTEXT, 10);

  // Cleanup (ordre FK)
  console.log("🧹 Cleaning DB…");
  await prisma.resume.deleteMany();
  await prisma.resumeTemplate.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.companyFollow.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.recruiter.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // 1) Création des templates de CV
  console.log("📝 Creating resume templates...");
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: passwordHash,
      name: "Admin User",
      role: Role.ADMIN,
    },
  });

  for (const template of resumeTemplates) {
    await prisma.resumeTemplate.create({
      data: {
        name: template.name,
        category: template.category,
        structure: template.structure,
        style: template.style,
        isPublic: template.isPublic,
        isPremium: template.isPremium,
        createdById: adminUser.id,
      },
    });
  }

  // 2) Companies + owner recruiter (COMPANY_MANAGER)
  console.log(`🏢 Creating ${NUM_COMPANIES} companies (with owner recruiters)…`);
  const companies: { id: string; name: string }[] = [];
  const companyToRecruiters: Record<string, { userId: string; recruiterId: string }[]> = {};

  for (let i = 0; i < NUM_COMPANIES; i++) {
    const name = faker.company.name() + (i % 4 === 0 ? " SARL" : "");
    const slug = `${slugify(name)}-${faker.string.alphanumeric(4)}`;

    const company = await prisma.company.create({
      data: {
        name,
        slug,
        description: faker.company.catchPhrase(),
        region: faker.helpers.arrayElement(REGIONS),
        city: faker.location.city(),
        website: faker.internet.url(),
        industry: faker.commerce.department(),
        size: faker.helpers.arrayElement(["1-10", "11-50", "51-200", "200+"]),
        verified: faker.datatype.boolean(),
      },
    });

    // create an owner user + recruiter (COMPANY_MANAGER)
    const owner = await prisma.user.create({
      data: {
        email: `owner+${slug}@example.com`,
        password: passwordHash,
        name: `${faker.person.firstName()} ${faker.person.lastName()}`,
        role: Role.RECRUITER,
        recruiter: {
          create: {
            companyId: company.id,
            title: "Owner",
            roleInCompany: CompanyRole.COMPANY_MANAGER,
          },
        },
      },
      include: { recruiter: true },
    });

    companies.push({ id: company.id, name: company.name });
    companyToRecruiters[company.id] = [{ userId: owner.id, recruiterId: owner.recruiter!.id }];
  }

  // 3) Additional recruiters (randomly assign to companies)
  console.log(`🧑‍💼 Creating ${NUM_RECRUITERS} additional recruiters and users…`);
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
            roleInCompany: CompanyRole.MEMBER,
          },
        },
      },
      include: { recruiter: true },
    });

    companyToRecruiters[company.id].push({ userId: user.id, recruiterId: user.recruiter!.id });
  }

  // 4) add a couple of fixed recruiters for quick login/testing
  const fixed1 = await prisma.user.create({
    data: {
      email: "hr@kiroo.cm",
      password: passwordHash,
      name: "Emmanuel Mba",
      role: Role.RECRUITER,
      recruiter: { create: { companyId: companies[0].id, title: "HR Manager", roleInCompany: CompanyRole.MEMBER } },
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
      recruiter: { create: { companyId: companies[1].id, title: "Talent Lead", roleInCompany: CompanyRole.MEMBER } },
    },
    include: { recruiter: true },
  });
  companyToRecruiters[companies[1].id].push({ userId: fixed2.id, recruiterId: fixed2.recruiter!.id });

  // 5) Candidates (users + candidate) + experiences & educations + CV
  console.log(`🧑‍🎓 Creating ${NUM_CANDIDATES} candidates (with experiences, educations & resumes)…`);
  const candidates: { id: string; userId: string }[] = [];
  const publicTemplates = await prisma.resumeTemplate.findMany({ where: { isPublic: true } });

  for (let i = 0; i < NUM_CANDIDATES; i++) {
    const email = faker.internet.email().toLowerCase();
    const name = faker.person.fullName();
    const city = faker.location.city();
    const country = "Cameroun";
    
    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
        role: Role.CANDIDATE,
        candidate: {
          create: {
            headline: faker.person.jobTitle(),
            bio: faker.lorem.paragraph(),
            locationCity: city,
            locationCountry: country,
            resumeUrl: faker.internet.url(),
            phone: faker.phone.number(),
            skills: faker.helpers.arrayElements(
              ["JavaScript", "Python", "React", "Node.js", "SQL", "Design", "DevOps", "UI/UX"],
              { min: 2, max: 5 }
            ),
            links: { linkedin: faker.internet.url(), website: faker.internet.url() },
          },
        },
      },
      include: { candidate: true },
    });

    // experiences (0..3)
    const experiences = [];
    const expCount = faker.number.int({ min: 0, max: 3 });
    for (let e = 0; e < expCount; e++) {
      const experience = await prisma.experience.create({
        data: {
          candidateId: user.candidate!.id,
          title: faker.person.jobTitle(),
          company: faker.company.name(),
          startDate: faker.date.past({ years: 5 }),
          endDate: faker.datatype.boolean() ? faker.date.recent({ days: 30 }) : null,
          description: faker.lorem.sentences(2),
        },
      });
      experiences.push(experience);
    }

    // educations (0..2)
    const educations = [];
    const eduCount = faker.number.int({ min: 0, max: 2 });
    for (let ed = 0; ed < eduCount; ed++) {
      const education = await prisma.education.create({
        data: {
          candidateId: user.candidate!.id,
          school: faker.company.name() + " University",
          degree: faker.helpers.arrayElement(["Licence", "Master", "Certificat"]),
          field: faker.helpers.arrayElement(["Informatique", "Design", "Finance", "Marketing"]),
          startDate: faker.date.past({ years: 6 }),
          endDate: faker.datatype.boolean() ? faker.date.past({ years: 1 }) : null,
        },
      });
      educations.push(education);
    }

    // Create resume with JSON structure
    const template = faker.helpers.arrayElement(publicTemplates);
    
    const resumeData: ResumeData = {
      personal: {
        fullName: name,
        title: user.candidate!.headline || faker.person.jobTitle(),
        email: email,
        phone: user.candidate!.phone || faker.phone.number(),
        location: `${city}, ${country}`,
        summary: user.candidate!.bio || faker.lorem.paragraph(),
        links: user.candidate!.links as any || {
          linkedin: faker.internet.url(),
          github: faker.internet.url()
        }
      },
      experiences: experiences.map(exp => ({
        id: exp.id,
        company: exp.company || faker.company.name(),
        position: exp.title,
        location: faker.location.city(),
        startDate: exp.startDate.toISOString().split('T')[0],
        endDate: exp.endDate ? exp.endDate.toISOString().split('T')[0] : '',
        current: !exp.endDate,
        description: exp.description || '',
        skills: faker.helpers.arrayElements(
          ["React", "Node.js", "Python", "SQL", "AWS", "Docker"],
          { min: 1, max: 3 }
        )
      })),
      education: educations.map(edu => ({
        id: edu.id,
        school: edu.school,
        degree: edu.degree || "Licence",
        field: edu.field || "Informatique",
        startDate: edu.startDate ? edu.startDate.toISOString().split('T')[0] : '',
        endDate: edu.endDate ? edu.endDate.toISOString().split('T')[0] : '',
        description: faker.lorem.sentence()
      })),
      skills: user.candidate!.skills.map(skill => ({
        id: faker.string.uuid(),
        name: skill,
        category: faker.helpers.arrayElement(["Technique", "Langages", "Frameworks", "Outils"]),
        level: faker.number.int({ min: 3, max: 5 })
      })),
      projects: Array.from({ length: faker.number.int({ min: 0, max: 2 }) }, () => ({
        id: faker.string.uuid(),
        name: faker.commerce.productName() + " Project",
        description: faker.lorem.paragraph(),
        technologies: faker.helpers.arrayElements(
          ["React", "Node.js", "MongoDB", "Express", "TypeScript"],
          { min: 2, max: 4 }
        ),
        link: faker.internet.url()
      })),
      languages: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
        id: faker.string.uuid(),
        name: faker.helpers.arrayElement(["Français", "Anglais", "Espagnol", "Allemand"]),
        level: faker.helpers.arrayElement(["Débutant", "Intermédiaire", "Avancé", "Natif"])
      })),
      certifications: Array.from({ length: faker.number.int({ min: 0, max: 2 }) }, () => ({
        id: faker.string.uuid(),
        name: faker.helpers.arrayElement(["AWS Certified", "Google Cloud", "Microsoft Azure", "Scrum Master"]),
        issuer: faker.company.name(),
        date: faker.date.past({ years: 2 }).toISOString().split('T')[0],
        link: faker.internet.url()
      }))
    };

    // Create resume with JSON content
    const layout = (template.structure as { layout?: string }).layout ?? "modern";

    const resume = await prisma.resume.create({
      data: {
        candidateId: user.candidate!.id,
        title: `CV - ${user.candidate!.headline}`,
        layout: layout,
        content: resumeData as unknown as Prisma.InputJsonValue,  // content JSON
        style: template.style ?? undefined,            // style optionnel
        isPublic: faker.datatype.boolean(),
        isPrimary: true,
        pdfUrl: user.candidate!.resumeUrl,
      }
    });


    candidates.push({ 
      id: user.candidate!.id, 
      userId: user.id
    });
  }

  // 6) Jobs (création + assign postedById from a recruiter of that company)
  console.log(`📄 Creating ${NUM_JOBS} jobs…`);
  const jobs = [];

  for (let i = 0; i < NUM_JOBS; i++) {
    const company = faker.helpers.arrayElement(companies);
    const title = faker.person.jobTitle();

    // pick a recruiter for this company (there is always at least the owner)
    const recs = companyToRecruiters[company.id] ?? [];
    const pickedRec = recs.length > 0 ? faker.helpers.arrayElement(recs) : null;

    const j = await prisma.job.create({
      data: {
        title,
        slug: `${slugify(title)}-${faker.string.alphanumeric(4)}`,
        companyId: company.id,
        postedById: pickedRec ? pickedRec.recruiterId : companyToRecruiters[companies[0].id][0].recruiterId, // fallback
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

  // 7) CompanyFollow (quelques follows aléatoires)
  console.log("⭐ Creating random company follows...");
  const followOps: Prisma.PrismaPromise<any>[] = [];
  
  for (const comp of companies) {
    const toFollow = faker.helpers.arrayElements(candidates, faker.number.int({ min: 0, max: 6 }));
    for (const f of toFollow) {
      followOps.push(
        prisma.companyFollow.create({
          data: { companyId: comp.id, candidateId: f.id },
        })
      );
    }
  }
  // execute in batches
  for (let i = 0; i < followOps.length; i += 50) {
    await prisma.$transaction(followOps.slice(i, i + 50));
  }

  // 8) Applications (éviter duplications : utiliser Set)
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
      
      // Get candidate's primary resume for CV URL
      const candidateResume = await prisma.resume.findFirst({
        where: { candidateId: cand.id, isPrimary: true }
      });
      
      appRows.push({
        jobId,
        candidateId: cand.id,
        message: faker.lorem.sentences({ min: 1, max: 2 }),
        cvUrl: candidateResume?.pdfUrl || faker.internet.url(),
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
    ResumeTemplates: resumeTemplates.length,
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
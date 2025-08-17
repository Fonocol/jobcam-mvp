import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("test1234", 10);

  // Nettoyer la base existante
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.recruiter.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // Création des entreprises camerounaises réalistes
  const companies = await prisma.$transaction([
    prisma.company.create({
      data: {
        name: "Kiro'o Games",
        description: "Premier studio de jeux vidéo en Afrique Centrale",
        region: "Centre"
      }
    }),
    prisma.company.create({
      data: {
        name: "Jangolo",
        description: "Plateforme éducative et solutions technologiques",
        region: "Littoral"
      }
    }),
    prisma.company.create({
      data: {
        name: "Digital Renter",
        description: "Agence digitale spécialisée en marketing et développement",
        region: "Ouest"
      }
    }),
    prisma.company.create({
      data: {
        name: "Africland",
        description: "Société immobilière leader au Cameroun",
        region: "Littoral"
      }
    }),
    prisma.company.create({
      data: {
        name: "Camtel",
        description: "Opérateur télécom national",
        region: "Centre"
      }
    })
  ]);

  // Création des recruteurs
  const recruiters = await prisma.$transaction([
    prisma.user.create({
      data: {
        email: "hr@kiroo.cm",
        password,
        name: "Emmanuel Mba",
        role: "RECRUITER",
        recruiter: {
          create: { companyId: companies[0].id }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: "recrutement@jangolo.cm",
        password,
        name: "Aïcha Diallo",
        role: "RECRUITER",
        recruiter: {
          create: { companyId: companies[1].id }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: "rh@digitalrenter.cm",
        password,
        name: "Franck Mbarga",
        role: "RECRUITER",
        recruiter: {
          create: { companyId: companies[2].id }
        }
      }
    })
  ]);

  // Création des candidats
  const candidates = await prisma.$transaction([
    prisma.user.create({
      data: {
        email: "jean.kamdem@yahoo.fr",
        password,
        name: "Jean Kamdem",
        role: "CANDIDATE",
        candidate: {
          create: {
            headline: "Développeur Fullstack",
            location: "Douala",
            resumeUrl: "https://drive.google.com/file/d/1lWEyw1y9F0PwfObDiCsaCDjo8EMW4KEu/view?usp=drive_link"
          }
        }
      },
      include: { candidate: true }, // <-- important
    }),
    prisma.user.create({
      data: {
        email: "aicha.mohamadou@gmail.com",
        password,
        name: "Aïcha Mohamadou",
        role: "CANDIDATE",
        candidate: {
          create: {
            headline: "Designer UI/UX",
            location: "Yaoundé",
            resumeUrl: "https://drive.google.com/file/d/1lWEyw1y9F0PwfObDiCsaCDjo8EMW4KEu/view?usp=drive_link"
          }
        }
      },
      include: { candidate: true }, // <-- important
    }),
    prisma.user.create({
      data: {
        email: "mbella.ekobo@hotmail.com",
        password,
        name: "Mbella Ekobo",
        role: "CANDIDATE",
        candidate: {
          create: {
            headline: "Chef de projet digital",
            location: "Bafoussam",
            resumeUrl: "https://drive.google.com/file/d/1lWEyw1y9F0PwfObDiCsaCDjo8EMW4KEu/view?usp=drive_link"
          }
        }
      },
      include: { candidate: true }, // <-- important
    })
  ]);

  // Création des offres d'emploi typiques
  const jobs = await prisma.$transaction([
    // Offres Kiro'o Games
    prisma.job.create({
      data: {
        title: "Développeur Unity",
        companyId: companies[0].id,
        region: "Centre",
        type: "CDI",
        description: "Nous recherchons un développeur Unity expérimenté pour rejoindre notre équipe de création de jeux vidéo africains."
      }
    }),
    prisma.job.create({
      data: {
        title: "Game Designer",
        companyId: companies[0].id,
        region: "Télétravail",
        type: "CDD",
        description: "Conception de mécaniques de jeu innovantes pour notre prochain titre."
      }
    }),

    // Offres Jangolo
    prisma.job.create({
      data: {
        title: "Développeur Flutter",
        companyId: companies[1].id,
        region: "Littoral",
        type: "CDI",
        description: "Développement d'applications éducatives mobiles avec Flutter."
      }
    }),
    prisma.job.create({
      data: {
        title: "Community Manager",
        companyId: companies[1].id,
        region: "Littoral",
        type: "Stage",
        description: "Animation des réseaux sociaux et création de contenu éducatif."
      }
    }),

    // Offres Digital Renter
    prisma.job.create({
      data: {
        title: "Expert SEO",
        companyId: companies[2].id,
        region: "Ouest",
        type: "Freelance",
        description: "Optimisation SEO pour nos clients et stratégie de contenu."
      }
    }),

    // Offres Africland
    prisma.job.create({
      data: {
        title: "Commercial Immobilier",
        companyId: companies[3].id,
        region: "Littoral",
        type: "CDI",
        description: "Prospection client et vente de biens immobiliers à Douala."
      }
    }),

    // Offres Camtel
    prisma.job.create({
      data: {
        title: "Ingénieur Réseaux",
        companyId: companies[4].id,
        region: "Centre",
        type: "CDI",
        description: "Maintenance et déploiement des infrastructures réseau."
      }
    })
  ]);

// Création de quelques candidatures (sans $transaction ici)
await prisma.application.createMany({
  data: [
    {
      jobId: jobs[0].id,
      candidateId: candidates[0].candidate!.id, // <-- id du Candidate
      message: "Passionné de jeux vidéo avec 2 ans d'expérience sur Unity",
      cvUrl: candidates[0].candidate!.resumeUrl ?? "https://storage.cv/jean-kamdem.pdf",
    },
    {
      jobId: jobs[2].id,
      candidateId: candidates[0].candidate!.id,
      message: "Expérience en développement mobile avec Flutter",
      cvUrl: candidates[0].candidate!.resumeUrl ?? "https://storage.cv/jean-kamdem.pdf",
    },
    {
      jobId: jobs[1].id,
      candidateId: candidates[1].candidate!.id,
      message: "Formation en design et passion pour les jeux vidéo",
      cvUrl: candidates[1].candidate!.resumeUrl ?? "https://storage.cv/aicha-mohamadou.pdf",
    },
    {
      jobId: jobs[4].id,
      candidateId: candidates[2].candidate!.id,
      message: "5 ans d'expérience en gestion de projets digitaux",
      cvUrl: candidates[2].candidate!.resumeUrl ?? "https://storage.cv/mbella-ekobo.pdf",
    },
  ],
});


  console.log("Seed complet avec succès !");
  console.table({
    Companies: companies.length,
    Recruiters: recruiters.length,
    Candidates: candidates.length,
    Jobs: jobs.length
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
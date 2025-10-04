// lib/resumeUtils.ts
import { prisma } from '@/lib/prisma';
import { ResumeData, ResumeStyle } from '@/types/resume';
import { Prisma } from '@prisma/client';

export async function createResume(candidateId: string, data: {
  title: string;
  content: ResumeData;
  layout?: string;
  style?: ResumeStyle;
}) {
  return await prisma.resume.create({
    data: {
      title: data.title,
      content: data.content as unknown as Prisma.InputJsonValue,
      layout: data.layout || 'modern',
      style: data.style === undefined ? undefined : (data.style as unknown as Prisma.InputJsonValue),
      candidateId: candidateId,
    },
  });
}


export async function updateResume(
  id: string,
  candidateId: string,
  data: {
    title?: string;
    content?: ResumeData;
    layout?: string;
    style?: ResumeStyle | null;
    isPublic?: boolean;
  }
) {
  return await prisma.resume.update({
    where: { id, candidateId },
    data: {
      ...data,
      content: data.content
        ? (data.content as unknown as Prisma.InputJsonValue)
        : undefined,
      style:
        data.style === undefined
          ? undefined
          : (data.style as unknown as Prisma.InputJsonValue),
      updatedAt: new Date(),
    },
  });
}


export async function getResumesByCandidate(candidateId: string) {
  return await prisma.resume.findMany({
    where: { candidateId },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getResumeById(id: string, candidateId: string) {
  return await prisma.resume.findFirst({
    where: { id, candidateId },
  });
}

export async function setPrimaryResume(id: string, candidateId: string) {
  // D'abord, désactiver tous les autres CV principaux
  await prisma.resume.updateMany({
    where: { candidateId, isPrimary: true },
    data: { isPrimary: false },
  });

  // Ensuite, définir celui-ci comme principal
  return await prisma.resume.update({
    where: { id, candidateId },
    data: { isPrimary: true },
  });
}

// Fonction pour pré-remplir un CV à partir du profil candidat
export async function createResumeFromProfile(candidateId: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { userId: candidateId },
    include: {
      experiences: true,
      educations: true,
      User: true,
    },
  });

  if (!candidate) {
    throw new Error('Candidat non trouvé');
  }

  const resumeData: ResumeData = {
    personal: {
      fullName: candidate.User.name || '',
      title: candidate.headline || '',
      email: candidate.User.email,
      phone: candidate.phone || '',
      location: [candidate.locationCity, candidate.locationState, candidate.locationCountry]
        .filter(Boolean)
        .join(', '),
      summary: candidate.bio || '',
      links: candidate.links as any || {},
    },
    experiences: candidate.experiences.map(exp => ({
      id: exp.id,
      company: exp.company || '',
      position: exp.title,
      location: '',
      startDate: exp.startDate.toISOString().split('T')[0],
      endDate: exp.endDate?.toISOString().split('T')[0] || '',
      current: exp.currently,
      description: exp.description || '',
      skills: [],
    })),
    education: candidate.educations.map(edu => ({
      id: edu.id,
      school: edu.school,
      degree: edu.degree || '',
      field: edu.field || '',
      startDate: edu.startDate?.toISOString().split('T')[0] || '',
      endDate: edu.endDate?.toISOString().split('T')[0] || '',
      description: '',
    })),
    skills: candidate.skills.map(skill => ({
      id: Math.random().toString(36).substr(2, 9),
      name: skill,
      category: 'Technical',
      level: 3,
    })),
    projects: [],
    languages: [],
    certifications: [],
  };

  return await createResume(candidateId, {
    title: `${candidate.User.name} - CV`,
    content: resumeData,
  });
}
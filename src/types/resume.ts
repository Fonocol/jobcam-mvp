// types/resume.ts
export interface ResumeData {
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
    startDate?: string;
    endDate?: string;
  }>;
  languages: Array<{
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'native';
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    link?: string;
  }>;
}

export interface ResumeStyle {
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

export interface ResumeTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail?: string;
  structure: {
    sections: string[];
    layout: 'modern' | 'classic' | 'creative' | 'minimalist';
  };
  style: ResumeStyle;
  isPublic: boolean;
  isPremium: boolean;
  price?: number;
}

// Type pour le modèle Prisma
export type PrismaResume = {
  id: string;
  candidateId: string;
  title: string;
  layout: string;
  content: ResumeData;
  style: ResumeStyle | null;
  isPublic: boolean;
  isPrimary: boolean;
  pdfUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};
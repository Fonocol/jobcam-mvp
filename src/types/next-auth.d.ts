// src/types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      candidateId?: string;
      recruiterId?: string;
      companyId?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: string;
    candidateId?: string;
    recruiterId?: string;
    companyId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    candidateId?: string;
    recruiterId?: string;
    companyId?: string | null;
  }
}

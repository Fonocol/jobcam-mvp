// src/auth.config.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";

const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const loginUrl = new URL("/api/auth/login", baseUrl).toString();

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(loginUrl, {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" },
          });

          if (!res.ok) {
            // récupérer message d'erreur si présent
            const err = await res.json().catch(() => null);
            throw new Error(err?.error ?? "Auth failed");
          }

          const user = await res.json();
          // user doit contenir id, email, name, role
          return user ?? null;
        } catch (err) {
          console.error("Authorize error:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;

        if (user.role === "CANDIDATE") {
        const candidate = await prisma.candidate.findUnique({
          where: { userId: user.id }
        });
        token.candidateId = candidate?.id;
        }
        if (user.role === "RECRUITER") {
          const recruiter = await prisma.recruiter.findUnique({
            where: { userId: user.id }
          });
          token.recruiterId = recruiter?.id;
          token.companyId = recruiter?.companyId;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token as any).id;
        session.user.role = (token as any).role;

        // Transférez les IDs au client
        session.user.candidateId = token.candidateId;
        session.user.recruiterId = token.recruiterId;
        session.user.companyId = token.companyId;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};


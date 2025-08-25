/*
  Warnings:

  - You are about to drop the `Resume` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResumeTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResumeVersion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Resume" DROP CONSTRAINT "Resume_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Resume" DROP CONSTRAINT "Resume_currentVersionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ResumeTemplate" DROP CONSTRAINT "ResumeTemplate_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."ResumeVersion" DROP CONSTRAINT "ResumeVersion_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ResumeVersion" DROP CONSTRAINT "ResumeVersion_templateId_fkey";

-- DropTable
DROP TABLE "public"."Resume";

-- DropTable
DROP TABLE "public"."ResumeTemplate";

-- DropTable
DROP TABLE "public"."ResumeVersion";

-- CreateTable
CREATE TABLE "public"."resumes" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "layout" TEXT NOT NULL DEFAULT 'modern',
    "content" JSONB NOT NULL,
    "style" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resume_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "thumbnail" TEXT,
    "structure" JSONB NOT NULL,
    "style" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resumes_candidateId_key" ON "public"."resumes"("candidateId");

-- AddForeignKey
ALTER TABLE "public"."resumes" ADD CONSTRAINT "resumes_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

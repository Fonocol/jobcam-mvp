/*
  Warnings:

  - You are about to drop the column `content` on the `ResumeVersion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ResumeVersion" DROP COLUMN "content",
ADD COLUMN     "html" TEXT,
ADD COLUMN     "markdown" TEXT,
ADD COLUMN     "templateId" TEXT;

-- CreateTable
CREATE TABLE "public"."ResumeTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResumeTemplate_isPublic_idx" ON "public"."ResumeTemplate"("isPublic");

-- AddForeignKey
ALTER TABLE "public"."ResumeTemplate" ADD CONSTRAINT "ResumeTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ResumeVersion" ADD CONSTRAINT "ResumeVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."ResumeTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

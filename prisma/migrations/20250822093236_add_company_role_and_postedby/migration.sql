/*
  Warnings:

  - Made the column `postedById` on table `Job` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."CompanyRole" AS ENUM ('COMPANY_MANAGER', 'MEMBER');

-- AlterTable
ALTER TABLE "public"."Job" ALTER COLUMN "postedById" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Recruiter" ADD COLUMN     "roleInCompany" "public"."CompanyRole" NOT NULL DEFAULT 'MEMBER';

-- CreateIndex
CREATE INDEX "Job_postedById_idx" ON "public"."Job"("postedById");

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "public"."Recruiter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

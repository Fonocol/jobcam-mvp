/*
  Warnings:

  - Added the required column `createdById` to the `resume_templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "resume_templates" ADD COLUMN     "createdById" TEXT NOT NULL;

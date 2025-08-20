-- AlterTable
ALTER TABLE "public"."Job" ALTER COLUMN "region" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Job_createdAt_idx" ON "public"."Job"("createdAt");

-- CreateIndex
CREATE INDEX "Job_region_idx" ON "public"."Job"("region");

-- CreateIndex
CREATE INDEX "Job_type_idx" ON "public"."Job"("type");

/*
  Warnings:

  - The primary key for the `Tutor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `addedBy` to the `Tutor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Tutor` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TutorRole" AS ENUM ('TUTOR', 'SENIOR_TUTOR', 'ADMIN_TUTOR');

-- AlterTable
ALTER TABLE "Tutor" DROP CONSTRAINT "Tutor_pkey",
ADD COLUMN     "addedBy" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" "TutorRole" NOT NULL DEFAULT 'TUTOR',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Tutor_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Tutor_id_seq";

-- CreateTable
CREATE TABLE "TutorAuditLog" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TutorAuditLog_tutorId_idx" ON "TutorAuditLog"("tutorId");

-- CreateIndex
CREATE INDEX "TutorAuditLog_createdAt_idx" ON "TutorAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Tutor_userId_idx" ON "Tutor"("userId");

-- CreateIndex
CREATE INDEX "Tutor_isActive_idx" ON "Tutor"("isActive");

-- AddForeignKey
ALTER TABLE "TutorAuditLog" ADD CONSTRAINT "TutorAuditLog_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

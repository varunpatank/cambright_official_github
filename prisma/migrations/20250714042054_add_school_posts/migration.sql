/*
  Warnings:

  - You are about to drop the column `minioPath` on the `School` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('ANNOUNCEMENT', 'EVENT');

-- AlterTable
ALTER TABLE "School" DROP COLUMN "minioPath";

-- CreateTable
CREATE TABLE "SchoolPost" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "postType" "PostType" NOT NULL DEFAULT 'ANNOUNCEMENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SchoolPost_schoolId_idx" ON "SchoolPost"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolPost_isActive_idx" ON "SchoolPost"("isActive");

-- CreateIndex
CREATE INDEX "SchoolPost_createdAt_idx" ON "SchoolPost"("createdAt");

-- AddForeignKey
ALTER TABLE "SchoolPost" ADD CONSTRAINT "SchoolPost_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

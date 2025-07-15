/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_categoryId_fkey";

-- DropIndex
DROP INDEX "Course_categoryId_idx";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "categoryId",
ADD COLUMN     "subjectId" TEXT;

-- DropTable
DROP TABLE "Category";

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE INDEX "Course_subjectId_idx" ON "Course"("subjectId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

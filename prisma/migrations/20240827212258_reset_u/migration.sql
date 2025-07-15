/*
  Warnings:

  - You are about to drop the `UserSubject` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserSubject" DROP CONSTRAINT "UserSubject_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "UserSubject" DROP CONSTRAINT "UserSubject_userId_fkey";

-- DropTable
DROP TABLE "UserSubject";

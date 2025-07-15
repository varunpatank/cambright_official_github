/*
  Warnings:

  - You are about to drop the column `XP` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `biog` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `followers` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `following` on the `Profile` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserTags" DROP CONSTRAINT "_UserTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserTags" DROP CONSTRAINT "_UserTags_B_fkey";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "XP",
DROP COLUMN "biog",
DROP COLUMN "followers",
DROP COLUMN "following";

-- CreateTable
CREATE TABLE "UserModel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "following" INTEGER NOT NULL DEFAULT 0,
    "biog" TEXT NOT NULL,
    "XP" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "UserModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserModel_id_key" ON "UserModel"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserModel_userId_key" ON "UserModel"("userId");

-- AddForeignKey
ALTER TABLE "_UserTags" ADD CONSTRAINT "_UserTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserTags" ADD CONSTRAINT "_UserTags_B_fkey" FOREIGN KEY ("B") REFERENCES "UserModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

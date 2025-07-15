/*
  Warnings:

  - The primary key for the `UserModel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `UserModel` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `followerId` on the `Follow` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `followedId` on the `Follow` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_UserTags` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followedId_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followerId_fkey";

-- DropForeignKey
ALTER TABLE "_UserTags" DROP CONSTRAINT "_UserTags_B_fkey";

-- AlterTable
ALTER TABLE "Follow" DROP COLUMN "followerId",
ADD COLUMN     "followerId" INTEGER NOT NULL,
DROP COLUMN "followedId",
ADD COLUMN     "followedId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserModel" DROP CONSTRAINT "UserModel_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "UserModel_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_UserTags" DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followedId_key" ON "Follow"("followerId", "followedId");

-- CreateIndex
CREATE UNIQUE INDEX "_UserTags_AB_unique" ON "_UserTags"("A", "B");

-- CreateIndex
CREATE INDEX "_UserTags_B_index" ON "_UserTags"("B");

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "UserModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followedId_fkey" FOREIGN KEY ("followedId") REFERENCES "UserModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserTags" ADD CONSTRAINT "_UserTags_B_fkey" FOREIGN KEY ("B") REFERENCES "UserModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

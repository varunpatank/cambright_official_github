/*
  Warnings:

  - You are about to drop the `UserModel` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_UserTags" DROP CONSTRAINT "_UserTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserTags" DROP CONSTRAINT "_UserTags_B_fkey";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "XP" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "followers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "following" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "UserModel";

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "_UserTags" ADD CONSTRAINT "_UserTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserTags" ADD CONSTRAINT "_UserTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

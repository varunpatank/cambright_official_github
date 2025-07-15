/*
  Warnings:

  - The primary key for the `UserModel` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followedId_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followerId_fkey";

-- DropForeignKey
ALTER TABLE "_UserTags" DROP CONSTRAINT "_UserTags_B_fkey";

-- AlterTable
ALTER TABLE "Follow" ALTER COLUMN "followerId" SET DATA TYPE TEXT,
ALTER COLUMN "followedId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "UserModel" DROP CONSTRAINT "UserModel_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserModel_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UserModel_id_seq";

-- AlterTable
ALTER TABLE "_UserTags" ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "UserModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followedId_fkey" FOREIGN KEY ("followedId") REFERENCES "UserModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserTags" ADD CONSTRAINT "_UserTags_B_fkey" FOREIGN KEY ("B") REFERENCES "UserModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - Added the required column `imageFullUrl` to the `Sprint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageId` to the `Sprint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageLinkHTML` to the `Sprint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageThumbUrl` to the `Sprint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUserName` to the `Sprint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `Sprint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sprint" ADD COLUMN     "imageFullUrl" TEXT NOT NULL,
ADD COLUMN     "imageId" TEXT NOT NULL,
ADD COLUMN     "imageLinkHTML" TEXT NOT NULL,
ADD COLUMN     "imageThumbUrl" TEXT NOT NULL,
ADD COLUMN     "imageUserName" TEXT NOT NULL,
ADD COLUMN     "orgId" TEXT NOT NULL;

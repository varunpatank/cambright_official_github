-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('SCHOOL_IMAGE', 'SCHOOL_BANNER', 'POST_IMAGE', 'COURSE_IMAGE', 'CHAPTER_VIDEO', 'NOTE_ATTACHMENT');

-- CreateEnum
CREATE TYPE "ChapterAdminRole" AS ENUM ('CHAPTER_ADMIN', 'CHAPTER_SUPER_ADMIN');

-- CreateTable
CREATE TABLE "AssetManager" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "minioPath" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterAdmin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "role" "ChapterAdminRole" NOT NULL DEFAULT 'CHAPTER_ADMIN',
    "assignedBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChapterAdmin_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "imageAssetKey" TEXT;

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "bannerAssetKey" TEXT,
ADD COLUMN     "imageAssetKey" TEXT;

-- AlterTable
ALTER TABLE "SchoolPost" ADD COLUMN     "imageAssetKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AssetManager_key_key" ON "AssetManager"("key");

-- CreateIndex
CREATE INDEX "AssetManager_key_idx" ON "AssetManager"("key");

-- CreateIndex
CREATE INDEX "AssetManager_assetType_idx" ON "AssetManager"("assetType");

-- CreateIndex
CREATE INDEX "AssetManager_uploadedBy_idx" ON "AssetManager"("uploadedBy");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterAdmin_userId_schoolId_key" ON "ChapterAdmin"("userId", "schoolId");

-- CreateIndex
CREATE INDEX "ChapterAdmin_userId_idx" ON "ChapterAdmin"("userId");

-- CreateIndex
CREATE INDEX "ChapterAdmin_schoolId_idx" ON "ChapterAdmin"("schoolId");

-- CreateIndex
CREATE INDEX "ChapterAdmin_role_idx" ON "ChapterAdmin"("role");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_imageAssetKey_fkey" FOREIGN KEY ("imageAssetKey") REFERENCES "AssetManager"("key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_imageAssetKey_fkey" FOREIGN KEY ("imageAssetKey") REFERENCES "AssetManager"("key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_bannerAssetKey_fkey" FOREIGN KEY ("bannerAssetKey") REFERENCES "AssetManager"("key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolPost" ADD CONSTRAINT "SchoolPost_imageAssetKey_fkey" FOREIGN KEY ("imageAssetKey") REFERENCES "AssetManager"("key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterAdmin" ADD CONSTRAINT "ChapterAdmin_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
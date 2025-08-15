-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "videoAssetKey" TEXT;

-- AlterTable
ALTER TABLE "NoteChapter" ADD COLUMN     "videoAssetKey" TEXT;

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "rank" INTEGER;

-- AlterTable
ALTER TABLE "SchoolPost" ADD COLUMN     "imageAssetKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "peopleHelped" INTEGER DEFAULT 0,
ADD COLUMN     "peopleInvolved" INTEGER DEFAULT 0,
ADD COLUMN     "volunteerHours" INTEGER DEFAULT 0;

-- CreateIndex
CREATE INDEX "School_rank_idx" ON "School"("rank");

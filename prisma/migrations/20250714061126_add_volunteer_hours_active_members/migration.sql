-- AlterTable
ALTER TABLE "School" ADD COLUMN     "activeMembers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "volunteerHours" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "School_volunteerHours_idx" ON "School"("volunteerHours");

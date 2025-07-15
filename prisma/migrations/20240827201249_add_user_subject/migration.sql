-- CreateTable
CREATE TABLE "UserSubject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSubject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSubject_subjectId_idx" ON "UserSubject"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubject_userId_subjectId_key" ON "UserSubject"("userId", "subjectId");

-- AddForeignKey
ALTER TABLE "UserSubject" ADD CONSTRAINT "UserSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubject" ADD CONSTRAINT "UserSubject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

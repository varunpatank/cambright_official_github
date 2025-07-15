/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Profile_userId_key";

-- CreateTable
CREATE TABLE "Tutor" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Tutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "notesubjectId" TEXT,
    "noteboardId" TEXT,
    "sessionlink" TEXT,
    "sessiondate" TEXT,
    "sessiontime" TEXT,
    "attachmentLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteAttachment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoteAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteSubject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "NoteSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteBoard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "NoteBoard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Added" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Added_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteCloudinaryData" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "playbackId" TEXT,
    "publicId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "notechapterId" TEXT NOT NULL,

    CONSTRAINT "NoteCloudinaryData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteUserProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notechapterId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoteUserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteChapter" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT,
    "position" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sessionlink" TEXT,
    "sessiondate" TEXT,
    "sessiontime" TEXT,
    "noteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoteChapter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_userId_key" ON "Tutor"("userId");

-- CreateIndex
CREATE INDEX "Note_notesubjectId_idx" ON "Note"("notesubjectId");

-- CreateIndex
CREATE INDEX "NoteAttachment_noteId_idx" ON "NoteAttachment"("noteId");

-- CreateIndex
CREATE UNIQUE INDEX "NoteSubject_name_key" ON "NoteSubject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NoteBoard_name_key" ON "NoteBoard"("name");

-- CreateIndex
CREATE INDEX "Added_noteId_idx" ON "Added"("noteId");

-- CreateIndex
CREATE UNIQUE INDEX "Added_userId_noteId_key" ON "Added"("userId", "noteId");

-- CreateIndex
CREATE UNIQUE INDEX "NoteCloudinaryData_notechapterId_key" ON "NoteCloudinaryData"("notechapterId");

-- CreateIndex
CREATE UNIQUE INDEX "NoteUserProgress_notechapterId_key" ON "NoteUserProgress"("notechapterId");

-- CreateIndex
CREATE INDEX "NoteUserProgress_notechapterId_idx" ON "NoteUserProgress"("notechapterId");

-- CreateIndex
CREATE UNIQUE INDEX "NoteUserProgress_userId_notechapterId_key" ON "NoteUserProgress"("userId", "notechapterId");

-- CreateIndex
CREATE INDEX "NoteChapter_noteId_idx" ON "NoteChapter"("noteId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_id_key" ON "Profile"("id");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_notesubjectId_fkey" FOREIGN KEY ("notesubjectId") REFERENCES "NoteSubject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_noteboardId_fkey" FOREIGN KEY ("noteboardId") REFERENCES "NoteBoard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteAttachment" ADD CONSTRAINT "NoteAttachment_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Added" ADD CONSTRAINT "Added_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteCloudinaryData" ADD CONSTRAINT "NoteCloudinaryData_notechapterId_fkey" FOREIGN KEY ("notechapterId") REFERENCES "NoteChapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteUserProgress" ADD CONSTRAINT "NoteUserProgress_notechapterId_fkey" FOREIGN KEY ("notechapterId") REFERENCES "NoteChapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteChapter" ADD CONSTRAINT "NoteChapter_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

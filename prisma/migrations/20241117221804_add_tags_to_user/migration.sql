-- CreateTable
CREATE TABLE "UserModel" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "following" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "XP" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserModel_email_key" ON "UserModel"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserModel_username_key" ON "UserModel"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_UserTags_AB_unique" ON "_UserTags"("A", "B");

-- CreateIndex
CREATE INDEX "_UserTags_B_index" ON "_UserTags"("B");

-- AddForeignKey
ALTER TABLE "_UserTags" ADD CONSTRAINT "_UserTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserTags" ADD CONSTRAINT "_UserTags_B_fkey" FOREIGN KEY ("B") REFERENCES "UserModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

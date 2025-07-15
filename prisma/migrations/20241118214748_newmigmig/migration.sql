/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `UserModel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserModel_name_key" ON "UserModel"("name");

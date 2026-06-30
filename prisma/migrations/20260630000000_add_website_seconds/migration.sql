-- Add persistent session-time tracking to users
ALTER TABLE "UserModel" ADD COLUMN IF NOT EXISTS "websiteSeconds" INTEGER NOT NULL DEFAULT 0;

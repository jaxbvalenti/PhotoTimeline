/*
  Warnings:

  - Made the column `location` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_recipientId_fkey";

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "location" SET DEFAULT 'Unknown Location';

-- CreateIndex
CREATE INDEX "Post_authorId_recipientId_idx" ON "Post"("authorId", "recipientId");

/*
  Warnings:

  - You are about to drop the column `url` on the `court_images` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `court_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "court_images" DROP COLUMN "url",
ADD COLUMN     "altText" TEXT,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false;

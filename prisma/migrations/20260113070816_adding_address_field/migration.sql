/*
  Warnings:

  - Added the required column `address` to the `courts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "courts" ADD COLUMN     "address" TEXT NOT NULL;

/*
  Warnings:

  - You are about to drop the column `orderId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `reply` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Review` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Review_orderId_key";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "orderId",
DROP COLUMN "reply",
DROP COLUMN "updatedAt";

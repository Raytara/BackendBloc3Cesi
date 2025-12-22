/*
  Warnings:

  - Added the required column `seller_id` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('EN_ATTENTE', 'APPROUVE', 'VENDU', 'REJETE');

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "seller_id" TEXT NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'EN_ATTENTE',
ALTER COLUMN "boutique_id" DROP NOT NULL;

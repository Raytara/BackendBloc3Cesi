/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Article` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_categoryId_fkey";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "categoryId",
ADD COLUMN     "boutique_id" TEXT,
ADD COLUMN     "category_id" TEXT;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "Boutique"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

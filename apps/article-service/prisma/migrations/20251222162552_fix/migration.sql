/*
  Warnings:

  - You are about to drop the column `boutique_id` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `Article` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "boutique_id",
DROP COLUMN "category_id",
ADD COLUMN     "categoryId" TEXT;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

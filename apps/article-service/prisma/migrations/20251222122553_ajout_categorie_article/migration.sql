-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "category_id" TEXT,
ALTER COLUMN "stock" DROP NOT NULL;

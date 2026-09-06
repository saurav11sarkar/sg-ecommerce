/*
  Warnings:

  - You are about to drop the column `shopId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `sellerStatus` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `shops` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sellerId` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_shopId_fkey";

-- DropForeignKey
ALTER TABLE "shops" DROP CONSTRAINT "shops_sellerId_fkey";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "shopId",
ADD COLUMN     "sellerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "sellerStatus";

-- DropTable
DROP TABLE "shops";

-- CreateTable
CREATE TABLE "seller" (
    "id" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "shopPhoto" TEXT,
    "shopCoverPhoto" TEXT,
    "discription" TEXT,
    "sellerStatus" "SellerStatus" DEFAULT 'pending',
    "nationalId" TEXT[],
    "tradeLicense" TEXT,
    "shopInfo" TEXT,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seller_sellerId_key" ON "seller"("sellerId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller" ADD CONSTRAINT "seller_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

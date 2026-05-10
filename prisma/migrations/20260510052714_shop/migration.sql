-- CreateTable
CREATE TABLE "shops" (
    "id" TEXT NOT NULL,
    "shopname" TEXT NOT NULL,
    "shopLogo" TEXT,
    "shopCoverPhoto" TEXT,
    "shopdiscribtion" TEXT,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shops_sellerId_key" ON "shops"("sellerId");

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

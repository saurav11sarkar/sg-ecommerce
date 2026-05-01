-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'buyer', 'seller');

-- CreateEnum
CREATE TYPE "SellerStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'buyer',
    "country" TEXT,
    "address" TEXT,
    "appartment" TEXT,
    "city" TEXT,
    "postcode" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "phone" TEXT,
    "otp" TEXT,
    "otpExpiry" TIMESTAMP(3),
    "sellerStatus" "SellerStatus",
    "verifiedForget" BOOLEAN,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

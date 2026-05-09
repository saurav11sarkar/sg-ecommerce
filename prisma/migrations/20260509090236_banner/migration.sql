-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "topLeftBanners" TEXT[],
    "topMiddleUpBanners" TEXT[],
    "topMiddleDownBanners" TEXT[],
    "topRightBanners" TEXT[],
    "middleSectionBanners" TEXT[],
    "lowerSectionBanners" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

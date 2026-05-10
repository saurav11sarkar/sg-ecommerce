import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { fileUpload } from 'src/app/helper/fileUploder';

@Injectable()
export class BannerService {
  constructor(private readonly prisma: PrismaService) {}

  private async uploadMultipleFiles(
    files?: Express.Multer.File[],
  ): Promise<string[]> {
    if (!files || files.length === 0) return [];
    return Promise.all(
      files.map(async (file) => {
        const result = await fileUpload.uploadToCloudinary(file);
        return result.url;
      }),
    );
  }

  async createBanner(
    _dto: CreateBannerDto,
    files: Record<string, Express.Multer.File[]>,
  ) {
    const [
      topLeftBanners,
      topMiddleUpBanners,
      topMiddleDownBanners,
      topRightBanners,
      middleSectionBanners,
      lowerSectionBanners,
    ] = await Promise.all([
      this.uploadMultipleFiles(files?.topLeftBanners),
      this.uploadMultipleFiles(files?.topMiddleUpBanners),
      this.uploadMultipleFiles(files?.topMiddleDownBanners),
      this.uploadMultipleFiles(files?.topRightBanners),
      this.uploadMultipleFiles(files?.middleSectionBanners),
      this.uploadMultipleFiles(files?.lowerSectionBanners),
    ]);

    return this.prisma.banner.create({
      data: {
        topLeftBanners,
        topMiddleUpBanners,
        topMiddleDownBanners,
        topRightBanners,
        middleSectionBanners,
        lowerSectionBanners,
      },
    });
  }

  async updateBanner(
    id: string,
    dto: UpdateBannerDto,
    files: Record<string, Express.Multer.File[]>,
  ) {
    const existing = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!existing) throw new HttpException('banner is not found', 404);

    const [
      newTopLeft,
      newTopMiddleUp,
      newTopMiddleDown,
      newTopRight,
      newMiddle,
      newLower,
    ] = await Promise.all([
      this.uploadMultipleFiles(files?.topLeftBanners),
      this.uploadMultipleFiles(files?.topMiddleUpBanners),
      this.uploadMultipleFiles(files?.topMiddleDownBanners),
      this.uploadMultipleFiles(files?.topRightBanners),
      this.uploadMultipleFiles(files?.middleSectionBanners),
      this.uploadMultipleFiles(files?.lowerSectionBanners),
    ]);

    const merge = (
      existing: string[],
      added: string[],
      removed: string[] = [],
    ) => [...existing, ...added].filter((url) => !removed.includes(url));

    return this.prisma.banner.update({
      where: { id },
      data: {
        topLeftBanners: merge(
          existing.topLeftBanners,
          newTopLeft,
          dto.removeTopLeftBanners,
        ),
        topMiddleUpBanners: merge(
          existing.topMiddleUpBanners,
          newTopMiddleUp,
          dto.removeTopMiddleUpBanners,
        ),
        topMiddleDownBanners: merge(
          existing.topMiddleDownBanners,
          newTopMiddleDown,
          dto.removeTopMiddleDownBanners,
        ),
        topRightBanners: merge(
          existing.topRightBanners,
          newTopRight,
          dto.removeTopRightBanners,
        ),
        middleSectionBanners: merge(
          existing.middleSectionBanners,
          newMiddle,
          dto.removeMiddleSectionBanners,
        ),
        lowerSectionBanners: merge(
          existing.lowerSectionBanners,
          newLower,
          dto.removeLowerSectionBanners,
        ),
      },
    });
  }
}

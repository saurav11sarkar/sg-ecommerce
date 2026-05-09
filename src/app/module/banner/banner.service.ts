import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { fileUpload } from 'src/app/helper/fileUploder';

@Injectable()
export class BannerService {
  constructor(private readonly prisma: PrismaService) {}

  private async uploadMultipleFiles(files?: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const result = await fileUpload.uploadToCloudinary(file);
        return result.url;
      }),
    );

    return uploadedFiles;
  }

  async createBanner(
    createBannerDto: CreateBannerDto,
    files: {
      topLeftBanners?: Express.Multer.File[];
      topMiddleUpBanners?: Express.Multer.File[];
      topMiddleDownBanners?: Express.Multer.File[];
      topRightBanners?: Express.Multer.File[];
      middleSectionBanners?: Express.Multer.File[];
      lowerSectionBanners?: Express.Multer.File[];
    },
  ) {
    const topLeftBanners = await this.uploadMultipleFiles(
      files?.topLeftBanners,
    );

    const topMiddleUpBanners = await this.uploadMultipleFiles(
      files?.topMiddleUpBanners,
    );

    const topMiddleDownBanners = await this.uploadMultipleFiles(
      files?.topMiddleDownBanners,
    );

    const topRightBanners = await this.uploadMultipleFiles(
      files?.topRightBanners,
    );

    const middleSectionBanners = await this.uploadMultipleFiles(
      files?.middleSectionBanners,
    );

    const lowerSectionBanners = await this.uploadMultipleFiles(
      files?.lowerSectionBanners,
    );

    const result = await this.prisma.banner.create({
      data: {
        topLeftBanners,
        topMiddleUpBanners,
        topMiddleDownBanners,
        topRightBanners,
        middleSectionBanners,
        lowerSectionBanners,
      },
    });

    return {
      success: true,
      message: 'Banner created successfully',
      data: result,
    };
  }

  async findAll() {
    const result = await this.prisma.banner.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: result,
    };
  }

  async findOne(id: string) {
    const result = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!result) {
      throw new NotFoundException('Banner not found');
    }

    return {
      success: true,
      data: result,
    };
  }

  async updateBanner(id: string, updateBannerDto: UpdateBannerDto) {
    const exist = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!exist) {
      throw new NotFoundException('Banner not found');
    }

    const result = await this.prisma.banner.update({
      where: { id },
      data: updateBannerDto,
    });

    return {
      success: true,
      message: 'Banner updated successfully',
      data: result,
    };
  }

  async removeBanner(id: string) {
    const exist = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!exist) {
      throw new NotFoundException('Banner not found');
    }

    await this.prisma.banner.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Banner deleted successfully',
    };
  }
}

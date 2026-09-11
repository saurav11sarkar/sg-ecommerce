import { BadRequestException, Injectable } from '@nestjs/common';
import buildWhereConditions from 'src/app/helper/buildWhereConditions';
import { fileUpload } from 'src/app/helper/fileUploder';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';
import { IFilterParams } from 'src/app/helper/pick';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFirstSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';

@Injectable()
export class SellerService {
  constructor(private readonly prisma: PrismaService) {}

  async createSeller(
    userId: string,
    createSellerDto: CreateFirstSellerDto,
    file?: {
      shopPhoto?: Express.Multer.File | Express.Multer.File[];
      shopCoverPhoto?: Express.Multer.File | Express.Multer.File[];
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user?.role !== 'buyer') {
      throw new BadRequestException('User is not buyer');
    }
    if (user?.isVerified === false) {
      throw new BadRequestException('User is not verified');
    }

    const shopPhoto = Array.isArray(file?.shopPhoto)
      ? file.shopPhoto[0]
      : file?.shopPhoto;
    if (shopPhoto && shopPhoto.buffer) {
      const { url } = await fileUpload.uploadToCloudinary(shopPhoto);
      createSellerDto.shopPhoto = url;
    }

    const shopCoverPhoto = Array.isArray(file?.shopCoverPhoto)
      ? file.shopCoverPhoto[0]
      : file?.shopCoverPhoto;
    if (shopCoverPhoto && shopCoverPhoto.buffer) {
      const { url } = await fileUpload.uploadToCloudinary(shopCoverPhoto);
      createSellerDto.shopCoverPhoto = url;
    }

    const seller = await this.prisma.seller.findUnique({
      where: {
        sellerId: userId,
      },
    });
    if (seller) {
      throw new BadRequestException('Seller already exists');
    }

    const createSeller = await this.prisma.seller.create({
      data: {
        sellerId: userId,
        ...createSellerDto,
      },
    });
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: 'seller',
      },
    });
    return createSeller;
  }

  async getAllSeller(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whenConditon = buildWhereConditions(params, [
      'shopName',
      'discription',
    ]);

    const [result, total] = await Promise.all([
      this.prisma.seller.findMany({
        where: whenConditon,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.seller.count({ where: whenConditon }),
    ]);

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  }

  async getSingleSeller(id: string) {
    const seller = await this.prisma.seller.findUnique({
      where: {
        id,
      },
    });
    if (!seller) {
      throw new BadRequestException('Seller not found');
    }
    return seller;
  }

  async updateSeller(
    userId: string,
    id: string,
    updateSellerDto: UpdateSellerDto,
    file?: {
      shopPhoto?: Express.Multer.File | Express.Multer.File[];
      shopCoverPhoto?: Express.Multer.File | Express.Multer.File[];
      nationalId?: Express.Multer.File[];
      tradeLicense?: Express.Multer.File | Express.Multer.File[];
      shopInfo?: Express.Multer.File | Express.Multer.File[];
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.role !== 'buyer') {
      throw new BadRequestException('User is not buyer');
    }
    if (user.isVerified === false) {
      throw new BadRequestException('User is not verified');
    }

    const seller = await this.prisma.seller.findUnique({
      where: {
        id,
      },
    });
    if (!seller) {
      throw new BadRequestException('Seller not found');
    }

    const shopPhoto = Array.isArray(file?.shopPhoto)
      ? file.shopPhoto[0]
      : file?.shopPhoto;
    if (shopPhoto && shopPhoto.buffer) {
      const { url } = await fileUpload.uploadToCloudinary(shopPhoto);
      updateSellerDto.shopPhoto = url;
    }

    const shopCoverPhoto = Array.isArray(file?.shopCoverPhoto)
      ? file.shopCoverPhoto[0]
      : file?.shopCoverPhoto;
    if (shopCoverPhoto && shopCoverPhoto.buffer) {
      const { url } = await fileUpload.uploadToCloudinary(shopCoverPhoto);
      updateSellerDto.shopCoverPhoto = url;
    }

    if (file?.nationalId && Array.isArray(file.nationalId)) {
      const validFiles = file.nationalId.filter((item) => item && item.buffer);
      if (validFiles.length > 0) {
        const results = await Promise.all(
          validFiles.map((item) => fileUpload.uploadToCloudinary(item)),
        );
        const urls = results.map((item) => item.url);
        updateSellerDto.nationalId = [...(seller.nationalId || []), ...urls];
      }
    }

    const tradeLicense = Array.isArray(file?.tradeLicense)
      ? file.tradeLicense[0]
      : file?.tradeLicense;
    if (tradeLicense && tradeLicense.buffer) {
      const { url } = await fileUpload.uploadToCloudinary(tradeLicense);
      updateSellerDto.tradeLicense = url;
    }

    const shopInfo = Array.isArray(file?.shopInfo)
      ? file.shopInfo[0]
      : file?.shopInfo;
    if (shopInfo && shopInfo.buffer) {
      const { url } = await fileUpload.uploadToCloudinary(shopInfo);
      updateSellerDto.shopInfo = url;
    }

    const updateSeller = await this.prisma.seller.update({
      where: {
        id,
      },
      data: updateSellerDto,
    });
    return updateSeller;
  }

  async deleteSeller(id: string) {
    const seller = await this.prisma.seller.findUnique({
      where: {
        id,
      },
    });
    if (!seller) {
      throw new BadRequestException('Seller not found');
    }
    const deleteSeller = await this.prisma.seller.delete({
      where: {
        id,
      },
    });
    return deleteSeller;
  }

  async adminApproveSeller(id: string) {
    const seller = await this.prisma.seller.findUnique({
      where: {
        id,
      },
    });
    if (!seller) {
      throw new BadRequestException('Seller not found');
    }
    if (seller.sellerStatus === 'approved') {
      throw new BadRequestException('Seller already approved');
    }
    if (seller.sellerStatus === 'rejected') {
      throw new BadRequestException('Seller already rejected');
    }
    const updateSeller = await this.prisma.seller.update({
      where: {
        id,
      },
      data: {
        sellerStatus: 'approved',
      },
    });
    return updateSeller;
  }

  async adminRejectSeller(id: string) {
    const seller = await this.prisma.seller.findUnique({
      where: {
        id,
      },
    });
    if (!seller) {
      throw new BadRequestException('Seller not found');
    }
    if (seller.sellerStatus === 'approved') {
      throw new BadRequestException('Seller already approved');
    }
    if (seller.sellerStatus === 'rejected') {
      throw new BadRequestException('Seller already rejected');
    }
    const updateSeller = await this.prisma.seller.update({
      where: {
        id,
      },
      data: {
        sellerStatus: 'rejected',
      },
    });
    return updateSeller;
  }
}

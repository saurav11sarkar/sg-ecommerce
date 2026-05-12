import { HttpException, Injectable } from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { fileUpload } from 'src/app/helper/fileUploder';
import { IFilterParams } from 'src/app/helper/pick';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';
import buildWhereConditions from 'src/app/helper/buildWhereConditions';
import { UpdateShopDto } from './dto/update-shop.dto';

type ShopFiles = {
  shopLogo?: Express.Multer.File[];
  shopCoverPhoto?: Express.Multer.File[];
};

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  private async uploadSingleFile(
    file?: Express.Multer.File,
  ): Promise<string | null> {
    if (!file || file.size === 0) return null;
    const result = await fileUpload.uploadToCloudinary(file);
    return result.url;
  }

  private getShopCreateData(dto: CreateShopDto) {
    const { shopLogo, shopCoverPhoto, ...shopData } = dto;
    return shopData;
  }

  private getShopUpdateData(dto: UpdateShopDto) {
    const { shopLogo, shopCoverPhoto, ...shopData } = dto;
    return shopData;
  }

  async createShop(
    userId: string,
    createShopDto: CreateShopDto,
    files?: ShopFiles,
  ) {
    const isExist = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!isExist) throw new HttpException('User is not found', 404);

    const existingShop = await this.prisma.shop.findUnique({
      where: { sellerId: userId },
    });
    if (existingShop) throw new HttpException('You already have a shop', 400);

    const [shopLogo, shopCoverPhoto] = await Promise.all([
      this.uploadSingleFile(files?.shopLogo?.[0]),
      this.uploadSingleFile(files?.shopCoverPhoto?.[0]),
    ]);

    const result = await this.prisma.shop.create({
      data: {
        ...this.getShopCreateData(createShopDto),
        sellerId: isExist.id,
        shopLogo,
        shopCoverPhoto,
      },
    });

    return result;
  }

  async getAllShops(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whenCondition = buildWhereConditions(params, [
      'shopname',
      'shopdiscribtion',
    ]);

    const [result, total] = await Promise.all([
      this.prisma.shop.findMany({
        where: whenCondition,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.shop.count({
        where: whenCondition,
      }),
    ]);

    return {
      data: result,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async getShopById(id: string) {
    const result = await this.prisma.shop.findUnique({
      where: { id },
    });
    if (!result) throw new HttpException('Not found', 404);
    return result;
  }

  async updateShop(
    userId: string,
    id: string,
    updateShopDto: UpdateShopDto,
    files?: ShopFiles,
  ) {
    const isExist = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!isExist) throw new HttpException('User is not found', 404);
    const existingShop = await this.prisma.shop.findUnique({
      where: { id },
    });
    if (!existingShop) throw new HttpException('Shop is not found', 404);

    if (existingShop.sellerId !== userId)
      throw new HttpException('You are not authorized', 403);

    const [shopLogo, shopCoverPhoto] = await Promise.all([
      this.uploadSingleFile(files?.shopLogo?.[0]),
      this.uploadSingleFile(files?.shopCoverPhoto?.[0]),
    ]);

    const result = await this.prisma.shop.update({
      where: { id },
      data: {
        ...this.getShopUpdateData(updateShopDto),
        shopLogo: shopLogo ?? undefined,
        shopCoverPhoto: shopCoverPhoto ?? undefined,
      },
    });
    if (!result) throw new HttpException('Not found', 404);
    return result;
  }

  async deleteShop(userId: string, id: string) {
    const isExist = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!isExist) throw new HttpException('User is not found', 404);
    const existingShop = await this.prisma.shop.findUnique({
      where: { id },
    });
    if (!existingShop) throw new HttpException('Shop is not found', 404);

    if (existingShop.sellerId !== userId)
      throw new HttpException('You are not authorized', 403);
    const result = await this.prisma.shop.delete({
      where: { id },
    });
    if (!result) throw new HttpException('Not found', 404);
    return result;
  }
}

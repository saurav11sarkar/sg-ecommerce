import { HttpException, Injectable } from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { fileUpload } from 'src/app/helper/fileUploder';

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  private async uploadSingleFile(
    file?: Express.Multer.File,
  ): Promise<string | null> {
    if (!file) return null;
    const result = await fileUpload.uploadToCloudinary(file);
    return result.url;
  }

  async createShop(
    userId: string,
    createShopDto: CreateShopDto,
    files?: {
      shopLogo?: Express.Multer.File[];
      shopCoverPhoto?: Express.Multer.File[];
    },
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
        ...createShopDto,
        sellerId: isExist.id,
        shopLogo,
        shopCoverPhoto,
      },
    });

    return result;
  }
}

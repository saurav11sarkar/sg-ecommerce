import { BadRequestException, Injectable } from '@nestjs/common';
import buildWhereConditions from 'src/app/helper/buildWhereConditions';
import { fileUpload } from 'src/app/helper/fileUploder';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';
import { IFilterParams } from 'src/app/helper/pick';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

type ProductFiles = {
  thumbnail?: Express.Multer.File;
  pictures?: Express.Multer.File[];
};

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(
    userId: string,
    createProductDto: CreateProductDto,
    file?: {
      thumbnail?: Express.Multer.File;
      pictures?: Express.Multer.File[];
    },
  ) {
    const seller = await this.prisma.seller.findUnique({
      where: {
        sellerId: userId,
      },
    });
    if (!seller) {
      throw new BadRequestException('Seller not found');
    }
    if (seller?.sellerStatus === 'pending') {
      throw new BadRequestException('Seller shop is not completed');
    }
    if (seller?.sellerStatus !== 'approved') {
      throw new BadRequestException('Seller is not approved');
    }
    if (createProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: {
          id: createProductDto.categoryId,
        },
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }
    if (file?.thumbnail) {
      const result = await fileUpload.uploadToCloudinary(file.thumbnail);
      createProductDto.thumbnail = result.url;
    }
    if (file?.pictures) {
      const results = Promise.all(
        file.pictures.map(fileUpload.uploadToCloudinary),
      );
      createProductDto.pictures = (await results).map((r) => r.url);
    }

    const createProduct = await this.prisma.product.create({
      data: {
        sellerId: userId,
        ...createProductDto,
      },
    });
    return createProduct;
  }

  async getAllProducts(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whenConditon = buildWhereConditions(params, ['title', 'description']);

    const [result, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whenConditon,
        include: {
          seller: true,
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.product.count({ where: whenConditon }),
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

  async getSingleProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        seller: true,
      },
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    return product;
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    file?: {
      thumbnail?: Express.Multer.File;
      pictures?: Express.Multer.File[];
    },
  ) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    if (file?.thumbnail) {
      const result = await fileUpload.uploadToCloudinary(file.thumbnail);
      updateProductDto.thumbnail = result.url;
    }
    if (file?.pictures) {
      const results = Promise.all(
        file.pictures.map(fileUpload.uploadToCloudinary),
      );
      updateProductDto.pictures = (await results).map((r) => r.url);
    }
    const updatedProduct = await this.prisma.product.update({
      where: {
        id,
      },
      data: updateProductDto,
    });
    return updatedProduct;
  }

  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    const deletedProduct = await this.prisma.product.delete({
      where: {
        id,
      },
    });
    return deletedProduct;
  }
}

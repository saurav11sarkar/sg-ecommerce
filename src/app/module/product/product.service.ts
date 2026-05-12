import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SellerStatus } from 'prisma/generated/prisma/enums';
import { fileUpload } from 'src/app/helper/fileUploder';
import { IFilterParams } from 'src/app/helper/pick';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';
import buildWhereConditions from 'src/app/helper/buildWhereConditions';

type ProductFiles = {
  thumbnail?: Express.Multer.File;
  pictures?: Express.Multer.File[];
};

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  private async uploadSingleFile(
    file?: Express.Multer.File,
  ): Promise<string | null> {
    if (!file || file.size === 0) return null;
    const result = await fileUpload.uploadToCloudinary(file);
    return result.url;
  }

  private async uploadManyFiles(
    files?: Express.Multer.File[],
  ): Promise<string[]> {
    if (!files || files.length === 0) return [];
    const results = await Promise.all(
      files
        .filter((f) => f.size > 0)
        .map((f) => fileUpload.uploadToCloudinary(f)),
    );
    return results.map((r) => r.url);
  }

  private getProductData(dto: CreateProductDto | UpdateProductDto) {
    const { thumbnail, pictures, categoryId, ...rest } = dto;
    return rest;
  }

  async createProduct(
    sellerId: string,
    dto: CreateProductDto,
    files: ProductFiles,
  ) {
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
    });
    if (!seller)
      throw new HttpException('Seller not found', HttpStatus.NOT_FOUND);

    if (seller.sellerStatus !== SellerStatus.approved)
      throw new HttpException('Seller not approved', HttpStatus.BAD_REQUEST);

    const shop = await this.prisma.shop.findUnique({ where: { sellerId } });
    if (!shop) throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);

    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category)
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);

    const [thumbnail, pictures] = await Promise.all([
      this.uploadSingleFile(files.thumbnail),
      this.uploadManyFiles(files.pictures),
    ]);

    return this.prisma.product.create({
      data: {
        title: dto.title,
        price: dto.price,
        quantityKg: dto.quantityKg,
        minimalQuantity: dto.minimalQuantity,
        description: dto.description,
        thumbnail,
        pictures,
        shop: { connect: { id: shop.id } },
        category: { connect: { id: dto.categoryId } },
      },
    });
  }

  async getAllProducts(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereCondition = buildWhereConditions(params, [
      'title',
      'description',
    ]);

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          shop: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  sellerStatus: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.product.count({ where: whereCondition }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, shop: true },
    });
    if (!product)
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    return product;
  }

  async updateProduct(
    sellerId: string,
    id: string,
    dto: UpdateProductDto,
    files: ProductFiles,
  ) {
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
    });
    if (!seller)
      throw new HttpException('Seller not found', HttpStatus.NOT_FOUND);

    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product)
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);

    const shop = await this.prisma.shop.findUnique({
      where: { id: product.shopId },
    });
    if (!shop || shop.sellerId !== sellerId)
      throw new HttpException('You are not authorized', HttpStatus.FORBIDDEN);

    const [thumbnail, pictures] = await Promise.all([
      this.uploadSingleFile(files.thumbnail),
      this.uploadManyFiles(files.pictures),
    ]);

    return this.prisma.product.update({
      where: { id },
      data: {
        ...this.getProductData(dto),
        thumbnail: thumbnail ?? undefined,
        pictures: pictures.length > 0 ? pictures : undefined,
        ...(dto.categoryId && {
          category: { connect: { id: dto.categoryId } },
        }),
      },
    });
  }

  async deleteProduct(sellerId: string, id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product)
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);

    const shop = await this.prisma.shop.findUnique({
      where: { id: product.shopId },
    });
    if (!shop || shop.sellerId !== sellerId)
      throw new HttpException('You are not authorized', HttpStatus.FORBIDDEN);

    return this.prisma.product.delete({ where: { id } });
  }
}

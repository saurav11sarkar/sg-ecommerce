import { HttpException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { fileUpload } from 'src/app/helper/fileUploder';
import { IFilterParams } from 'src/app/helper/pick';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';
import buildWhereConditions from 'src/app/helper/buildWhereConditions';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(data: CreateCategoryDto, file?: Express.Multer.File) {
    const existing = await this.prisma.category.findUnique({
      where: {
        title: data.title,
      },
    });
    if (existing) throw new HttpException('Already create', 400);
    if (file) {
      const { url } = await fileUpload.uploadToCloudinary(file);
      data.image = url;
    }
    const result = await this.prisma.category.create({ data });
    return result;
  }

  async getAllCategory(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);

    const whereCondition = buildWhereConditions(params, ['title']);

    const result = await this.prisma.category.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
    const total = await this.prisma.category.count({
      where: whereCondition,
    });
    return {
      data: result,
      mete: {
        total,
        page,
        limit,
      },
    };
  }

  async getSingleCategory(id: string) {
    const result = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });
    if (!result) throw new HttpException('Not found', 404);

    return result;
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryDto,
    file?: Express.Multer.File,
  ) {
    const existing = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });
    if (!existing) throw new HttpException('Not found', 404);
    if (file) {
      const { url } = await fileUpload.uploadToCloudinary(file);
      data.image = url;
    }
    const result = await this.prisma.category.update({
      where: {
        id,
      },
      data,
    });
    return result;
  }

  async deleteCategory(id: string) {
    const result = await this.prisma.category.delete({
      where: {
        id,
      },
    });
    if (!result) throw new HttpException('Not found', 404);
    return result;
  }
}

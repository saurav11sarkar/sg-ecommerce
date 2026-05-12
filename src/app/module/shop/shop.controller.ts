import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/app/middlewares/auth.guard';

import type { Request } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helper/fileUploder';
import pick from 'src/app/helper/pick';
import { UserRole } from '../../../../prisma/generated/prisma/enums';

type ShopFiles = {
  shopLogo?: Express.Multer.File[];
  shopCoverPhoto?: Express.Multer.File[];
};

const sanitizeShopFiles = (files?: ShopFiles): ShopFiles => {
  const sanitizedFiles: ShopFiles = {};

  if (files?.shopLogo?.[0]?.size) {
    sanitizedFiles.shopLogo = files.shopLogo;
  }

  if (files?.shopCoverPhoto?.[0]?.size) {
    sanitizedFiles.shopCoverPhoto = files.shopCoverPhoto;
  }

  return sanitizedFiles;
};

@ApiTags('shop')
@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  @ApiOperation({ summary: 'Shop create is successfully' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard(UserRole.seller))
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'shopLogo', maxCount: 1 },
        { name: 'shopCoverPhoto', maxCount: 1 },
      ],
      fileUpload.uploadConfig,
    ),
  )
  @HttpCode(HttpStatus.CREATED)
  async createShop(
    @Req() req: Request,
    @Body() createShopDto: CreateShopDto,
    @UploadedFiles() files?: ShopFiles,
  ) {
    const userId = req.user!.id;
    const result = await this.shopService.createShop(
      userId,
      createShopDto,
      sanitizeShopFiles(files),
    );

    return {
      message: 'Shop created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all shops is successfully' })
  @ApiQuery({ name: 'shopname', required: false })
  @ApiQuery({ name: 'shopdiscribtion', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  async getAllShops(@Req() req: Request) {
    const filters = pick(req.query, ['shopname', 'shopdiscribtion']);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.shopService.getAllShops(filters, options);

    return {
      message: 'Shops retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shop by id is successfully' })
  async getShopById(@Param('id') id: string) {
    const result = await this.shopService.getShopById(id);

    return {
      message: 'Shop retrieved successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Shop update is successfully' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard(UserRole.seller))
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'shopLogo', maxCount: 1 },
        { name: 'shopCoverPhoto', maxCount: 1 },
      ],
      fileUpload.uploadConfig,
    ),
  )
  @HttpCode(HttpStatus.OK)
  async updateShop(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateShopDto: UpdateShopDto,
    @UploadedFiles() files?: ShopFiles,
  ) {
    const userId = req.user!.id;
    const result = await this.shopService.updateShop(
      userId,
      id,
      updateShopDto,
      sanitizeShopFiles(files),
    );

    return {
      message: 'Shop updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Shop delete is successfully' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard(UserRole.seller))
  async deleteShop(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user!.id;
    const result = await this.shopService.deleteShop(userId, id);

    return {
      message: 'Shop deleted successfully',
      data: result,
    };
  }
}

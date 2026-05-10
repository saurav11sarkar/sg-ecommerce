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
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import { UserRole } from 'prisma/generated/prisma/enums';
import type { Request } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helper/fileUploder';

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
    @UploadedFiles()
    files?: {
      shopLogo?: Express.Multer.File[];
      shopCoverPhoto?: Express.Multer.File[];
    },
  ) {
    const userId = req.user!.id;
    const result = await this.shopService.createShop(
      userId,
      createShopDto,
      files,
    );

    return {
      message: 'Shop created successfully',
      data: result,
    };
  }
}

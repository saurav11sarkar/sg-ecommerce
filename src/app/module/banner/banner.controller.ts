import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import { fileUpload } from 'src/app/helper/fileUploder';

const BANNER_FIELDS = [
  { name: 'topLeftBanners', maxCount: 10 },
  { name: 'topMiddleUpBanners', maxCount: 10 },
  { name: 'topMiddleDownBanners', maxCount: 10 },
  { name: 'topRightBanners', maxCount: 10 },
  { name: 'middleSectionBanners', maxCount: 10 },
  { name: 'lowerSectionBanners', maxCount: 10 },
];

@ApiTags('Banners')
@Controller('banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  @ApiOperation({ summary: 'Create Banner' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiBody({ type: CreateBannerDto })
  @UseInterceptors(
    FileFieldsInterceptor(BANNER_FIELDS, fileUpload.uploadConfig),
  )
  @HttpCode(HttpStatus.CREATED)
  async createBanner(
    @Body() dto: CreateBannerDto,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
  ) {
    const data = await this.bannerService.createBanner(dto, files);
    return { message: 'Banner created successfully', data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Add or Remove images in a Banner' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiBody({ type: UpdateBannerDto })
  @UseInterceptors(
    FileFieldsInterceptor(BANNER_FIELDS, fileUpload.uploadConfig),
  )
  async updateBanner(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDto,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
  ) {
    const data = await this.bannerService.updateBanner(id, dto, files);
    return { message: 'Banner updated successfully', data };
  }
}

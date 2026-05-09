import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helper/fileUploder';
import { AuthGuard } from 'src/app/middlewares/auth.guard';

@ApiTags('banner')
@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  @ApiOperation({ summary: 'Create Banner' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth("access-token")
  @UseGuards(AuthGuard('admin'))
  @ApiBody({
    type: CreateBannerDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'topLeftBanners', maxCount: 10 },
        { name: 'topMiddleUpBanners', maxCount: 10 },
        { name: 'topMiddleDownBanners', maxCount: 10 },
        { name: 'topRightBanners', maxCount: 10 },
        { name: 'middleSectionBanners', maxCount: 10 },
        { name: 'lowerSectionBanners', maxCount: 10 },
      ],
      fileUpload.uploadConfig,
    ),
  )
  @HttpCode(HttpStatus.CREATED)
  async createBanner(
    @Body() createBannerDto: CreateBannerDto,
    @UploadedFiles()
    files: {
      topLeftBanners?: Express.Multer.File[];
      topMiddleUpBanners?: Express.Multer.File[];
      topMiddleDownBanners?: Express.Multer.File[];
      topRightBanners?: Express.Multer.File[];
      middleSectionBanners?: Express.Multer.File[];
      lowerSectionBanners?: Express.Multer.File[];
    },
  ) {
    const result = await this.bannerService.createBanner(
      createBannerDto,
      files,
    );
  }
}

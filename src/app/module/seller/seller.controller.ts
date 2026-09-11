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
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import type { Request } from 'express';
import pick from 'src/app/helper/pick';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import { CreateFirstSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { SellerService } from './seller.service';

@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new seller' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('buyer'))
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'shopPhoto', maxCount: 1 },
      { name: 'shopCoverPhoto', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  async createSeller(
    @Req() req: Request,
    @Body() createSellerDto: CreateFirstSellerDto,
    @UploadedFiles()
    file: {
      shopPhoto: Express.Multer.File;
      shopCoverPhoto: Express.Multer.File;
    },
  ) {
    const result = await this.sellerService.createSeller(
      req.user!.id,
      createSellerDto,
      file,
    );
    return {
      message: 'Seller created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all sellers' })
  @ApiBearerAuth('access-token')
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'sortBy',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'sortOrder',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'searchTerm',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'shopName',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'sellerStatus',
    type: 'string',
    required: false,
  })
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async getAllSeller(@Req() req: Request) {
    const filters = pick(req.query, ['searchTerm', 'shopName', 'sellerStatus']);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.sellerService.getAllSeller(filters, options);
    return {
      message: 'Sellers fetched successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a single seller' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async getSingleSeller(@Param('id') id: string) {
    const result = await this.sellerService.getSingleSeller(id);
    return {
      message: 'Seller fetched successfully',
      data: result,
    };
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update a single seller' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('buyer'))
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'shopPhoto', maxCount: 1 },
      { name: 'shopCoverPhoto', maxCount: 1 },
      { name: 'nationalId', maxCount: 2 },
      { name: 'tradeLicense', maxCount: 1 },
      { name: 'shopInfo', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  async updateSeller(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateSellerDto: UpdateSellerDto,
    @UploadedFiles()
    file: {
      shopPhoto: Express.Multer.File;
      shopCoverPhoto: Express.Multer.File;
      nationalId: Express.Multer.File[];
      tradeLicense: Express.Multer.File;
      shopInfo: Express.Multer.File;
    },
  ) {
    const result = await this.sellerService.updateSeller(
      req.user!.id,
      id,
      updateSellerDto,
      file,
    );
    return {
      message: 'Seller updated successfully',
      data: result,
    };
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a single seller' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteSeller(@Param('id') id: string) {
    const result = await this.sellerService.deleteSeller(id);
    return {
      message: 'Seller deleted successfully',
      data: result,
    };
  }

  @Patch('/:id/approve')
  @ApiOperation({ summary: 'Approve a single seller' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async adminApproveSeller(@Param('id') id: string) {
    const result = await this.sellerService.adminApproveSeller(id);
    return {
      message: 'Seller approved successfully',
      data: result,
    };
  }

  @Patch('/:id/reject')
  @ApiOperation({ summary: 'Reject a single seller' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async adminRejectSeller(@Param('id') id: string) {
    const result = await this.sellerService.adminRejectSeller(id);
    return {
      message: 'Seller rejected successfully',
      data: result,
    };
  }
}

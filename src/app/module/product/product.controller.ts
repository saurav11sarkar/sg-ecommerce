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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import { UserRole } from 'prisma/generated/prisma/enums';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helper/fileUploder';
import pick from 'src/app/helper/pick';
import type { Request } from 'express';

type RawProductFiles = {
  thumbnail?: Express.Multer.File[];
  pictures?: Express.Multer.File[];
};

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create product' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard(UserRole.seller))
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'pictures', maxCount: 10 },
      ],
      fileUpload.uploadConfig,
    ),
  )
  @HttpCode(HttpStatus.CREATED)
  async createProduct(
    @Req() req: Request,
    @Body() dto: CreateProductDto,
    @UploadedFiles() files?: RawProductFiles,
  ) {
    const sellerId = req.user!.id;
    const data = await this.productService.createProduct(sellerId, dto, {
      thumbnail: files?.thumbnail?.[0], 
      pictures: files?.pictures?.filter((f) => f.size > 0),
    });
    return { message: 'Product created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'description', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  async getAllProducts(@Req() req: Request) {
    const filters = pick(req.query, ['title', 'description']);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.productService.getAllProducts(filters, options);
    return {
      message: 'Products retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  async getProductById(@Param('id') id: string) {
    const data = await this.productService.getProductById(id);
    return { message: 'Product retrieved successfully', data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard(UserRole.seller))
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'pictures', maxCount: 10 },
      ],
      fileUpload.uploadConfig,
    ),
  )
  async updateProduct(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() files?: RawProductFiles,
  ) {
    const sellerId = req.user!.id;
    const data = await this.productService.updateProduct(sellerId, id, dto, {
      thumbnail: files?.thumbnail?.[0],
      pictures: files?.pictures?.filter((f) => f.size > 0),
    });
    return { message: 'Product updated successfully', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard(UserRole.seller))
  async deleteProduct(@Req() req: Request, @Param('id') id: string) {
    const sellerId = req.user!.id;
    const data = await this.productService.deleteProduct(sellerId, id);
    return { message: 'Product deleted successfully', data };
  }
}

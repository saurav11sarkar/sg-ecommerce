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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCategoryDto } from './dto/create-category.dto';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import { fileUpload } from 'src/app/helper/fileUploder';
import type { Request } from 'express';
import pick from 'src/app/helper/pick';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({
    summary: 'create category',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('image', fileUpload.uploadConfig))
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @Body() body: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.categoryService.createCategory(body, file);

    return {
      message: 'category create success',
      data: result,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'get all category',
  })
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'title',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  async getAllCategory(@Req() req: Request) {
    const filters = pick(req.query, ['searchTerm', 'title']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.categoryService.getAllCategory(filters, options);
    return {
      message: 'category get success',
      meta: result.mete,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'get single category',
  })
  @HttpCode(HttpStatus.OK)
  async getSingleCategory(@Param('id') id: string) {
    const result = await this.categoryService.getSingleCategory(id);

    return {
      message: 'category get success',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'update category',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('image', fileUpload.uploadConfig))
  @HttpCode(HttpStatus.OK)
  async updateCategory(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.categoryService.updateCategory(id, body, file);

    return {
      message: 'category update success',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'delete category',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteCategory(@Param('id') id: string) {
    const result = await this.categoryService.deleteCategory(id);

    return {
      message: 'category delete success',
      data: result,
    };
  }
}

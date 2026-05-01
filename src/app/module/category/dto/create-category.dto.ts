import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiPropertyOptional({ example: 'ELECTRONICS' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ type: String, format: 'binary' })
  image?: any;
}

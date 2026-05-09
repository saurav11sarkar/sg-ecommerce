import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBannerDto {
  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Top Left Banner Images',
  })
  @IsOptional()
  topLeftBanners?: any[];

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Top Middle Up Banner Images',
  })
  @IsOptional()
  topMiddleUpBanners?: any[];

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Top Middle Down Banner Images',
  })
  @IsOptional()
  topMiddleDownBanners?: any[];

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Top Right Banner Images',
  })
  @IsOptional()
  topRightBanners?: any[];

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Middle Section Banner Images',
  })
  @IsOptional()
  middleSectionBanners?: any[];

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Lower Section Banner Images',
  })
  @IsOptional()
  lowerSectionBanners?: any[];
}

import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const fileArrayProp = (description: string) =>
  ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description,
  });

export class CreateBannerDto {
  @fileArrayProp('Top Left Banner Images')
  @IsOptional()
  topLeftBanners?: any[];

  @fileArrayProp('Top Middle Up Banner Images')
  @IsOptional()
  topMiddleUpBanners?: any[];

  @fileArrayProp('Top Middle Down Banner Images')
  @IsOptional()
  topMiddleDownBanners?: any[];

  @fileArrayProp('Top Right Banner Images')
  @IsOptional()
  topRightBanners?: any[];

  @fileArrayProp('Middle Section Banner Images')
  @IsOptional()
  middleSectionBanners?: any[];

  @fileArrayProp('Lower Section Banner Images')
  @IsOptional()
  lowerSectionBanners?: any[];
}

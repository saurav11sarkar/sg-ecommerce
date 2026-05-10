import { IsArray, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

const ToArray = () =>
  Transform(({ value }) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
  });

export class UpdateBannerDto {
  @ApiPropertyOptional({ type: 'array', items: { type: 'string', format: 'binary' } })
  @IsOptional()
  topLeftBanners?: any[];

  @ApiPropertyOptional({ type: 'array', items: { type: 'string', format: 'binary' } })
  @IsOptional()
  topMiddleUpBanners?: any[];

  @ApiPropertyOptional({ type: 'array', items: { type: 'string', format: 'binary' } })
  @IsOptional()
  topMiddleDownBanners?: any[];

  @ApiPropertyOptional({ type: 'array', items: { type: 'string', format: 'binary' } })
  @IsOptional()
  topRightBanners?: any[];

  @ApiPropertyOptional({ type: 'array', items: { type: 'string', format: 'binary' } })
  @IsOptional()
  middleSectionBanners?: any[];

  @ApiPropertyOptional({ type: 'array', items: { type: 'string', format: 'binary' } })
  @IsOptional()
  lowerSectionBanners?: any[];

  // ─── REMOVE URLs ──────────────────────────────────────────────────────────
  @ApiPropertyOptional({ type: [String], description: 'Image URLs to remove from topLeftBanners' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ToArray()
  removeTopLeftBanners?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ToArray()
  removeTopMiddleUpBanners?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ToArray()
  removeTopMiddleDownBanners?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ToArray()
  removeTopRightBanners?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ToArray()
  removeLowerSectionBanners?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ToArray()
  removeMiddleSectionBanners?: string[];
}
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShopDto {
  @ApiProperty({ description: 'Shop name' })
  @IsString()
  shopname: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Shop Logo',
  })
  @IsOptional()
  shopLogo?: any;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Shop Cover Photo',
  })
  @IsOptional()
  shopCoverPhoto?: any;

  @ApiPropertyOptional({ description: 'Shop Description' })
  @IsOptional()
  @IsString()
  shopdiscribtion?: string;
}

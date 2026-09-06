import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateSellerDto {
  @ApiProperty({ description: 'Shop name' })
  @IsString()
  shopName!: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Shop Logo',
  })
  @IsOptional()
  shopPhoto?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Shop Cover Photo',
  })
  @IsOptional()
  shopCoverPhoto?: string;

  @ApiPropertyOptional({ description: 'Shop Description' })
  @IsOptional()
  @IsString()
  discription?: string;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'National ID images',
  })
  @IsOptional()
  nationalId?: string[];

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Trade License',
  })
  @IsOptional()
  tradeLicense?: string;

  @ApiPropertyOptional({ description: 'Additional shop info' })
  @IsOptional()
  @IsString()
  shopInfo?: string;
}

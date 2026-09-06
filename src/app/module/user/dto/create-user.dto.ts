import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiPropertyOptional({ example: 'saurav' })
  @IsString()
  @IsNotEmpty({ message: 'Name is requried' })
  firstName: string;

  @ApiPropertyOptional({ example: 'sarkar' })
  @IsString()
  @IsNotEmpty({ message: 'Name is requried' })
  lastName: string;

  @ApiPropertyOptional({ example: 'user@gmail.com' })
  @IsEmail()
  @IsNotEmpty({ message: 'Email is requried' })
  email: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsString()
  @IsNotEmpty({ message: 'Password is requried' })
  password: string;

  @ApiPropertyOptional({ example: 'Bangladesh' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: '152,Mirpur 10,Dhaka' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'josnna vila' })
  @IsString()
  @IsOptional()
  appartment?: string;

  @ApiPropertyOptional({ example: 'Dhaka' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: '1216' })
  @IsString()
  @IsOptional()
  postcode?: string;

  @ApiPropertyOptional({ example: '+8801716661390' })
  @IsString()
  @IsOptional()
  phone?: string;
}

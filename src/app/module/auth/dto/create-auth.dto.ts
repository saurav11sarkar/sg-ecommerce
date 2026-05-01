import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { UserRole } from 'prisma/generated/prisma/enums';
import { string } from 'zod';

export class CreateAuthDto {
  @ApiPropertyOptional({ example: 'saurav' })
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiPropertyOptional({ example: 'sarkar' })
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiPropertyOptional({ example: 'Bangladesh' })
  @IsString()
  @IsOptional()
  country: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.buyer })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  @IsString()
  image?: string;
}

export class LoginAuthDto {
  @ApiProperty({ example: 'saurav@example.com' })
  @IsEmail({}, { message: 'Valid email is required' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'saurav@example.com' })
  @IsEmail({}, { message: 'Valid email is required' })
  @IsNotEmpty()
  email: string;
}

export class VerifyEmailDto {
  @ApiProperty({ example: 'saurav@example.com' })
  @IsEmail({}, { message: 'Valid email is required' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'saurav@example.com' })
  @IsEmail({}, { message: 'Valid email is required' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'newsecret123' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldsecret123' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  oldPassword: string;

  @ApiProperty({ example: 'newsecret123' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  newPassword: string;
}

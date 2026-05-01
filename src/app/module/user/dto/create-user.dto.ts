import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiPropertyOptional({ example: '' })
  @IsString()
  @IsNotEmpty({ message: 'Name is requried' })
  firstName: string;

  @ApiPropertyOptional({ example: '' })
  @IsString()
  @IsNotEmpty({ message: 'Name is requried' })
  lastName: string;

  @ApiPropertyOptional({ example: '' })
  @IsEmail()
  @IsNotEmpty({ message: 'Email is requried' })
  email: string;

  @ApiPropertyOptional({ example: '' })
  @IsString()
  @IsNotEmpty({ message: 'Password is requried' })
  password: string;
}

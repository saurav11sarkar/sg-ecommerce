import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcrypt';
import config from 'src/app/config';
import { IFilterParams } from 'src/app/helper/pick';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';
import buildWhereConditions from 'src/app/helper/buildWhereConditions';
import { SellerStatus, UserRole } from 'prisma/generated/prisma/enums';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (user)
      throw new HttpException('user alrady exists', HttpStatus.BAD_REQUEST);

    const hashPassword = await bcrypt.hash(
      createUserDto.password,
      Number(config.bcryptSaltRounds) || 10,
    );

    const result = await this.prisma.user.create({
      data: {
        firstName: createUserDto.firstName,
        email: createUserDto.email,
        password: hashPassword,
      },
    });

    return result;
  }

  async getAllUser(params: IFilterParams, options: IOptions) {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper(options);
    const whenCondition = buildWhereConditions(params, ['name', 'email']);

    const [result, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whenCondition,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.user.count({
        where: whenCondition,
      }),
    ]);

    return {
      data: result,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async switchToSaller(userId: string) {
    const exist = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!exist) {
      throw new HttpException('User is not found', 404);
    }

    if (exist.role === UserRole.seller) {
      throw new HttpException('You alrady seller account', 400);
    }

    const result = await this.prisma.user.update({
      where: { id: exist.id },
      data: {
        role: UserRole.seller,
        sellerStatus: SellerStatus.pending,
      },
    });

    return result;
  }
}

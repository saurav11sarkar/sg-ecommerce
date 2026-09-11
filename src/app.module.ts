import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './app/module/auth/auth.module';
import { BannerModule } from './app/module/banner/banner.module';
import { CategoryModule } from './app/module/category/category.module';
import { UserModule } from './app/module/user/user.module';
import { PrismaModule } from './prisma/prisma.module';

import { ProductModule } from './app/module/product/product.module';
import { SellerModule } from './app/module/seller/seller.module';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CategoryModule,
    BannerModule,
    ProductModule,
    SellerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

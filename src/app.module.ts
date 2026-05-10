import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './app/module/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './app/module/auth/auth.module';
import { CategoryModule } from './app/module/category/category.module';
import { BannerModule } from './app/module/banner/banner.module';
import { ShopModule } from './app/module/shop/shop.module';

@Module({
  imports: [UserModule, PrismaModule, ConfigModule.forRoot({ isGlobal: true }), AuthModule, CategoryModule, BannerModule, ShopModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

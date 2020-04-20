import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ProductModule } from './modules/product/product.module';

export function moduleFactory(imageS3Bucket: string): any {
  @Module({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [
          () => ({
            imageS3Bucket,
          }),
        ],
      }),
      ProductModule,
    ],
  })
  class AppModule {}

  return AppModule;
}

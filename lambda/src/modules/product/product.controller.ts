import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

import { IFileSignedUrl } from './fileSignedUrl.interface';

const s3 = new AWS.S3({ useAccelerateEndpoint: true });

@ApiTags('Product')
@Controller('products')
export class ProductController {
  private imageS3Bucket: string;

  constructor(private configService: ConfigService) {
    this.imageS3Bucket = this.configService.get('imageS3Bucket');
  }

  @Post('/signedUrl')
  async getSignedUrlForProductImage(
    @Body() { contentType, filePath }: IFileSignedUrl
  ): Promise<{
    fileName: string;
    s3Url: string;
  }> {
    if (!contentType) {
      throw new HttpException('Missing contentType', 400);
    }

    if (!filePath) {
      throw new HttpException('Missing filePath', 400);
    }

    const filetype: string = contentType.split('/')[1];

    // Rename file, I just want to show there is a way to rename file before you it into S3
    // Renaming file might be necessary for SEO
    const fileName: string = `${uuid()}.${filetype}`;

    const params = {
      Bucket: this.imageS3Bucket,
      Key: fileName,
      Expires: 3600,
      ContentType: contentType,
      ACL: 'public-read',
    };

    const s3Url = await s3.getSignedUrlPromise('putObject', params);

    return {
      fileName,
      s3Url,
    };
  }
}

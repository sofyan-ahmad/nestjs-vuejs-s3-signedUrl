import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import dotenv = require('dotenv');
import { moduleFactory } from './app.module';

const { parsed } = dotenv.config({
  path: process.cwd() + '/.env',
});
process.env = { ...parsed, ...process.env };

async function bootstrap(): Promise<void> {
  const nestApp = await NestFactory.create(
    moduleFactory(process.env.AWS_BUCKET_NAME)
  );

  const options = new DocumentBuilder().build();

  const document = SwaggerModule.createDocument(nestApp, options);

  SwaggerModule.setup('/swagger', nestApp, document);

  nestApp.enableCors();

  await nestApp.listen(parsed.APP_PORT);

  console.info(`Server started at http://localhost:${parsed.APP_PORT}`);
  console.info(
    `Swagger started at http://localhost:${parsed.APP_PORT}/swagger`
  );
}

bootstrap();

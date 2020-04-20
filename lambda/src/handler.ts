import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { APIGatewayProxyHandler, Context } from 'aws-lambda';
import { createServer, proxy } from 'aws-serverless-express';
import express = require('express');
import { Server } from 'http';

import { moduleFactory } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

// NOTE: If you get ERR_CONTENT_DECODING_FAILED in your browser, this is likely
// due to a compressed response (e.g. gzip) which has not been handled correctly
// by aws-serverless-express and/or API Gateway. Add the necessary MIME types to
// binaryMimeTypes below
const binaryMimeTypes: string[] = [];

// const cachedServers: { key: string; server: Server }[];
let cachedServers: Server;

process.on('unhandledRejection', (reason) => {
  console.error(reason);
});

process.on('uncaughtException', (reason) => {
  console.error(reason);
});

function bootstrapServer(imageS3Bucket: string): Promise<Server> {
  try {
    const expressApp = express();

    const adapter = new ExpressAdapter(expressApp);

    return NestFactory.create(moduleFactory(imageS3Bucket), adapter)
      .then((app) => {
        const options = new DocumentBuilder().build();

        const document = SwaggerModule.createDocument(app, options);

        expressApp.use((_, res, next) => {
          res.header('Access-Control-Allow-Origin', '*');
          res.header(
            'Access-Control-Allow-Methods',
            'GET,PUT,PATCH,POST,DELETE'
          );
          res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
          next();
        });

        expressApp.get('/swagger', (_req, res) => {
          res.send(JSON.stringify(document));
        });

        app.enableCors({
          credentials: true,
          allowedHeaders:
            'Content-Type,Accept,X-Amz-Date,Authorization,X-Api-Key,X-Requested-With,Realm',
        });

        app.useGlobalPipes(new ValidationPipe());

        app.useGlobalFilters(new AllExceptionsFilter());

        return app.init();
      })
      .then(() => createServer(expressApp, undefined, binaryMimeTypes));
  } catch (error) {
    return Promise.reject(error);
  }
}

export const handler: APIGatewayProxyHandler = async (
  event: any,
  context: Context
) => {
  if (!cachedServers) {
    const server = await bootstrapServer(process.env.AWS_BUCKET_NAME);

    cachedServers = server;
  }

  return proxy(cachedServers, event, context, 'PROMISE').promise;
};

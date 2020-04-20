import { HttpException } from '@nestjs/common';
import { Lambda } from 'aws-sdk';
import dotenv = require('dotenv');
import _ from 'lodash';

// Load dot environment before load other modules
const { parsed } = dotenv.config({
  path: process.cwd() + '/.env',
});
process.env = { ...parsed, ...process.env };

const lambda: Lambda = new Lambda();

export function handleResponse(resultStr: any): any {
  if (resultStr && isJSON(resultStr)) {
    const result = JSON.parse(resultStr) as {
      statusCode?: number;
      statusText?: string;
      message?: string;
      data?: object;
      error?: object;
    };

    if (result.statusCode) {
      throw new HttpException(
        result.data ||
          result.message ||
          result.statusText ||
          'Error on fetching data',
        result.statusCode || 404
      );
    }
    return result;
  }
}

export async function invoker(
  params: Lambda.Types.InvocationRequest
): Promise<string> {
  try {
    const result = await lambda.invoke(params).promise();

    const resPayload: {
      statusCode: number;
      body: string;
      headers: any;
    } = JSON.parse(result.Payload.toString());

    if (resPayload.statusCode === 500) {
      throw new HttpException(
        resPayload.body && !_.isEmpty(JSON.parse(resPayload.body))
          ? resPayload.body
          : 'Error invoking lambda function ' + params.FunctionName,
        resPayload.statusCode
      );
    }

    return resPayload.body;
  } catch (error) {
    throw new HttpException(error.message, error.statusCode || 500);
  }
}

export function isJSON(str: string): boolean {
  try {
    const obj = JSON.parse(str);
    if (obj && typeof obj === 'object' && obj !== null) {
      return true;
    }
  } catch (err) {
    return false;
  }
}

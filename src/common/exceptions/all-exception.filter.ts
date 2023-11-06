import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx: HttpArgumentsHost = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    let errorMessage;
    let httpStatus;
    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'object' && response.hasOwnProperty('message')) {
        errorMessage = response['message'];

        if (Array.isArray(errorMessage)) {
          errorMessage = errorMessage.join(', ');
        }
      } else if (typeof response === 'string') {
        errorMessage = response;
      }
    } else if (exception instanceof Error) {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

      errorMessage = exception.message;
    }

    const responseBody = {
      statusCode: httpStatus,
      ...(errorMessage && { message: errorMessage }),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

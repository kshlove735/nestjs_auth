import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger();
  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const startTime: number = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime: number = Date.now() - startTime;

      this.logger.log(`[${method}] ${originalUrl} : ${statusCode} - ${responseTime}ms`);
    });

    next();
  }
}

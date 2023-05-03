import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AppService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) { }

  getHello(): string {
    this.logger.error('log')
    this.logger.warn('warn')
    this.logger.info('info')
    this.logger.http('http')

    this.logger.verbose('log')
    this.logger.debug('log')
    this.logger.silly('silly')


    return 'Hello World!';
  }
}

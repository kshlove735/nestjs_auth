import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Controller()
export class AppController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    // this.logger.error('error', 'dd')
    // this.logger.log('debug', 'dd')
    // this.logger.debug('debug', 'debug')
    // this.logger.verbose('verbose', 'verbose')

    return this.appService.getHello();
  }
}

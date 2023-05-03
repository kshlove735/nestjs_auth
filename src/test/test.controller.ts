import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { TestService } from './test.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Controller('test')
export class TestController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly testService: TestService,
  ) { }

  @Get()
  findAll(): string {

    try {

      throw new Error('에러 발생')

    } catch (err) {

      this.logger.error(err, { line: err.stack.split('\n')[1].trim() })

    }
    return this.testService.findAll();
  }

}

import { Controller, Get, HttpException, HttpStatus, Inject, UnauthorizedException } from '@nestjs/common';
import { TestService } from './test.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { classToPlain, plainToClass } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';
import { Public } from 'src/common/decorator/public.decorator';

@Controller('test')
export class TestController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly testService: TestService,
  ) {}

  // @Public()
  @Get()
  findAll(): string {
    try {
      // throw new Error('에러 발생');
      // throw new UnauthorizedException();
      throw new HttpException('Not_Found', HttpStatus.NOT_FOUND);
    } catch (err) {
      this.logger.silly(err, { line: err.stack.split('\n')[1].trim() });
      this.logger.error(err, { line: err.stack.split('\n')[1].trim() });
    }
    // console.log(process.env.PORT);

    return this.testService.findAll();
  }
}

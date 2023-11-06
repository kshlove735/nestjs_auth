import { Injectable } from '@nestjs/common';

@Injectable()
export class TestService {
  findAll(): string {
    return `This action returns all test`;
  }
}

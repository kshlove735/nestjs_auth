import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FileService } from './file.service';

import { ApiExtraModels, ApiTags } from '@nestjs/swagger';

@ApiTags('file')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}
}

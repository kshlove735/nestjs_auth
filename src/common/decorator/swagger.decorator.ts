import { Type, applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiPostResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    // statusCode: 201
    ApiCreatedResponse({
      schema: {
        allOf: [{ $ref: getSchemaPath(model) }],
      },
    }),
  );
};

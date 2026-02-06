import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

export function ToNumberArray() {
  return applyDecorators(
    Transform(({ value }) => {
      if (Array.isArray(value)) {
        return value.map(Number);
      }
      if (typeof value === 'string') {
        return value.split(',').map(Number);
      }
      if (typeof value === 'number') {
        return [value];
      }
      return [];
    }),
  );
}

import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BadRequestException } from '../middleware/http-exception.filter';

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(
      metatype as new (...args: unknown[]) => object,
      value,
    );
    const errors = await validate(object);
    if (errors.length > 0) {
      const isDebugMode = process.env.NODE_ENV !== 'production';
      throw new BadRequestException(
        isDebugMode ? this.mapErrors(errors) : 'Validation failed',
      );
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private mapErrors(
    errors: ValidationError[],
  ): Array<{ field: string; message: string }> {
    return errors?.map((err) => ({
      field: err.property,
      message: Object.values(err.constraints || {}).join(', '),
    }));
  }
}

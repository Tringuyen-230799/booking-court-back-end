import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsArray,
  IsUUID,
  IsUrl,
  IsNumber,
  MinLength,
  MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ToNumberArray } from 'src/shared/decorator/ToNumberArray';
import { Type } from 'class-transformer';

export class CreateCourtSchema {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  rating?: number;

  // hourlyPrice stored in DB as Decimal(10,2). Accept numeric input; transform to number here.
  @IsNumber()
  @Min(0)
  hourlyPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  eventSurcharge?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean = true;

  @IsOptional()
  @IsBoolean()
  isIndoor?: boolean = false;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  facilities?: string[];

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];
}

export class UpdateCourtDto extends PartialType(CreateCourtSchema) {}

export class QueryCourtsSchema {
  @IsString()
  @IsOptional()
  search: string;

  @ToNumberArray()
  @IsOptional()
  sportTypes?: number[];

  @ToNumberArray()
  @IsOptional()
  @IsArray()
  amenities?: number[];

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  min?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  max?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  rating?: number;

  @Type(() => Number)
  @IsNumber()
  page: number;

  @Type(() => Number)
  @IsNumber()
  limit: number;
}

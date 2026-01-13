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
import { Decimal } from '@prisma/client/runtime/client';

export class CreateCourtDto {
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

export class UpdateCourtDto extends PartialType(CreateCourtDto) {}

export class CourtDto {
  id: string;
  name: string;
  rating: number | null;
  hourlyPrice: number; // Prisma Decimal serialized as string
  eventSurcharge?: number | null;
  isAvailable: boolean;
  isIndoor: boolean;
  categories?: { name: string }[];
  facilities?: { name: string }[];
  images?: { imageUrl: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CourtQueryResult {
  images: {
    imageUrl: string;
  }[];
  categories: {
    category: {
      name: string;
    };
  }[];
  facilities: {
    facility: {
      id: number;
      name: string;
    };
  }[];
  id: string;
  name: string;
  rating: number | null;
  hourlyPrice: Decimal | number;
  eventSurcharge: Decimal | null | number;
  isAvailable: boolean;
  isIndoor: boolean;
  createdAt: Date;
  updatedAt: Date;
}

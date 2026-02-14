import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { $Enums } from 'generated/prisma';

export class BookingsSchemaQuery {
  @IsDateString()
  @IsOptional()
  date: string;
}

export class CreateBookingDto {
  @IsUUID()
  courtId: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @Type(() => Number)
  @IsNumber()
  categoryId: number;

  @IsUUID()
  userId: string;
}

export type ReponseBookingCourtDetail = Array<{
  id: string;
  bookingReference: string;
  startTime: Date;
  endTime: Date;
  status: $Enums.BookingStatus;
}>;

import { IsDateString, IsOptional } from 'class-validator';
import { $Enums } from 'generated/prisma';

export class BookingsSchemaQuery {
  @IsDateString()
  @IsOptional()
  date: string;
}

export type ReponseBookingCourtDetail = Array<{
  id: string;
  bookingReference: string;
  startTime: Date;
  endTime: Date;
  status: $Enums.BookingStatus;
}>;

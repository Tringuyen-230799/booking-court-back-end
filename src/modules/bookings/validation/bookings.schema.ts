import { IsDateString, IsOptional } from 'class-validator';

export class BookingsSchemaQuery {
  @IsDateString()
  @IsOptional()
  date: Date;
}

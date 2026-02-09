import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsSchemaQuery } from './dto/bookings.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  async findAll(@Query() query: BookingsSchemaQuery) {
    return await this.bookingsService.findAll(query);
  }

  @Get(':courtId')
  async findCourt(
    @Param('courtId', new ParseUUIDPipe()) courtId: string,
    @Query() query: BookingsSchemaQuery,
  ) {
    if (!courtId) {
      throw new BadRequestException('Court ID is required');
    }

    const courtBooking = await this.bookingsService.findByCourtId(
      courtId,
      query,
    );

    if (!courtBooking?.length) {
      return [];
    }

    return courtBooking;
  }
}

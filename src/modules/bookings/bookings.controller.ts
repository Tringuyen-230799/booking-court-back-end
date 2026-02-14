import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsSchemaQuery, CreateBookingDto } from './dto/bookings.dto';
import { DateTime } from 'luxon';
import { CourtsService } from '../courts/courts.service';
import { UsersService } from '../users/users.service';
import { BOOKING_HOUR } from 'src/shared/constant/booking';

@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly courtsService: CourtsService,
    private readonly usersService: UsersService,
  ) {}

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

  @Post()
  async create(
    @Body()
    payload: CreateBookingDto,
  ) {
    const { startTime, endTime, categoryId, courtId, userId } = payload;
    const startHour = DateTime.fromISO(startTime);
    const endHour = DateTime.fromISO(endTime);

    if (!startHour.isValid || !endHour.isValid) {
      throw new BadRequestException('Invalid date format');
    }

    if (startHour.toISODate() !== endHour.toISODate()) {
      throw new BadRequestException('Invalid time booking');
    }

    const openingHour = startHour.set({
      hour: BOOKING_HOUR.START_TIME,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    const closingHour = endHour.set({
      hour: BOOKING_HOUR.END_TIME,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    if (
      startHour.toMillis() < openingHour.toMillis() ||
      endHour.toMillis() > closingHour.toMillis()
    ) {
      throw new BadRequestException(
        'Booking time must be within business hours',
      );
    }

    if (startHour.toMillis() >= endHour.toMillis()) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (startHour.minute % 30 !== 0 || endHour.minute % 30 !== 0) {
      throw new BadRequestException(
        'Time Does not align with 30-minute intervals',
      );
    }

    const totalMinutes = endHour.toMillis() - startHour.toMillis();

    const endTimeValid = totalMinutes > 0 ? totalMinutes % 30 === 0 : false;

    if (!endTimeValid) {
      throw new BadRequestException(
        'Booking duration must be in 30-minute increments',
      );
    }

    const court = await this.courtsService.getCourtById(courtId, categoryId);

    if (!court) {
      throw new BadRequestException(
        'Court not found or the does not support your sport type',
      );
    }

    const user = await this.usersService.findUserById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isAvailable = await this.bookingsService.checkBooking(payload);

    if (isAvailable) {
      throw new BadRequestException('The selected time slot is already booked');
    }

    return await this.bookingsService.create({
      ...payload,
      totalPrice: court.hourlyPrice,
    });
  }
}

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
import { REQUIRED_TIME_SLOTS } from 'src/shared/constant/booking';
import { CourtsService } from '../courts/courts.service';
import { UsersService } from '../users/users.service';

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

    // Validate time slots 6:00 - 23:00
    // Still need to validate the date

    const openingHour = 6;
    const closingHour = 21;

    const startHour = DateTime.fromISO(startTime);
    const endHour = DateTime.fromISO(endTime);

    if (openingHour < startHour.hour && endHour.hour > closingHour) {
      throw new BadRequestException('Invalid time booking');
    }

    if (startHour.toMillis() >= endHour.toMillis()) {
      throw new BadRequestException('Invalid time booking');
    }

    const startMinutes = startHour.minute;

    if (
      startMinutes !== REQUIRED_TIME_SLOTS[0] &&
      startMinutes !== REQUIRED_TIME_SLOTS[1]
    ) {
      throw new BadRequestException('Invalid time booking');
    }

    const totalMinutes = endHour.toMillis() - startHour.toMillis();

    const endTimeValid = totalMinutes > 0 ? totalMinutes % 30 === 0 : false;

    if (!endTimeValid) {
      throw new BadRequestException('Invalid time booking');
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

import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/shared/config/Prisma/prisma.service';
import { getBusinessHoursInUTC } from './helpers/getBusinessHoursInUTC';
import {
  BookingsSchemaQuery,
  CreateBookingDto,
  ReponseBookingCourtDetail,
} from './dto/bookings.dto';
import { randomUUID } from 'node:crypto';
import { BOOKING_STATUS } from 'src/shared/constant/booking';
import { DateTime } from 'luxon';
@Injectable()
export class BookingsService {
  constructor(private readonly prismaClient: PrismaService) {}

  async findAll(query: BookingsSchemaQuery) {
    const businessHours = getBusinessHoursInUTC(query.date);

    return await this.prismaClient.booking.findMany({
      where: {
        status: 'CONFIRMED',
        startTime: {
          gte: businessHours.start,
        },
        endTime: {
          lte: businessHours.end,
        },
      },
      include: {
        court: {
          select: { name: true, rating: true },
        },
      },
    });
  }

  async findByCourtId(
    id: string,
    query: BookingsSchemaQuery,
  ): Promise<ReponseBookingCourtDetail> {
    const whereClause: Prisma.BookingWhereInput = {
      courtId: id,
    };

    // Apply date filter if provided
    if (query.date) {
      const businessHours = getBusinessHoursInUTC(query.date);
      whereClause.startTime = { gte: businessHours.start };
      whereClause.endTime = { lte: businessHours.end };
    }

    const bookings = await this.prismaClient.booking.findMany({
      where: whereClause,
      select: {
        id: true,
        bookingReference: true,
        startTime: true,
        endTime: true,
        status: true,
        court: {
          select: { name: true, rating: true },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return bookings;
  }

  async create(payload: CreateBookingDto & { totalPrice: number }) {
    return await this.prismaClient.$transaction(async (tx) => {
      const { courtId, endTime, startTime, userId, categoryId, totalPrice } =
        payload;
      const isBooking = await tx.booking.findUnique({
        where: {
          unique_court_time_slot: {
            courtId: courtId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
          },
        },
      });

      if (isBooking) {
        throw new Error('The selected time slot is already booked');
      }

      const newBookings = await tx.booking.create({
        data: {
          bookingReference: randomUUID(),
          courtId: courtId,
          userId: userId,
          startTime: DateTime.fromISO(startTime).toUTC().toJSDate(),
          endTime: DateTime.fromISO(endTime).toUTC().toJSDate(),
          status: BOOKING_STATUS.PENDING_PAYMENT,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
          categoryId,
          totalPrice,
        },
      });

      return newBookings;
    });
  }

  async checkBooking(payload: CreateBookingDto) {
    const bookingCourt = await this.prismaClient.booking.findUnique({
      where: {
        unique_court_time_slot: {
          courtId: payload.courtId,
          startTime: new Date(payload.startTime),
          endTime: new Date(payload.endTime),
        },
      },
    });

    return bookingCourt;
  }
}

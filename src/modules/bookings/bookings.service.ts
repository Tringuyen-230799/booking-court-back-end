import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/shared/config/Prisma/prisma.service';
import {
  BookingsSchemaQuery,
  ReponseBookingCourtDetail,
} from './dto/bookings.dto';
@Injectable()
export class BookingsService {
  constructor(private readonly prismaClient: PrismaService) {}

  /**
   * Helper to convert Vietnam business hours (6 AM - 11 PM) to UTC
   * for database queries
   */
  private getBusinessHoursInUTC(date: string) {
    // Parse date in Vietnam timezone
    const vietnamDate = DateTime.fromISO(date, { zone: 'Asia/Ho_Chi_Minh' });

    // Business hours: 6:00 AM Vietnam
    const startOfBusinessDay = vietnamDate.set({
      hour: 6,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    // Business hours: 11:00 PM Vietnam
    const endOfBusinessDay = vietnamDate.set({
      hour: 23,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    // Convert to UTC and return as JS Date objects
    return {
      start: startOfBusinessDay.toUTC().toJSDate(),
      end: endOfBusinessDay.toUTC().toJSDate(),
    };
  }

  async findAll(query: BookingsSchemaQuery) {
    const businessHours = this.getBusinessHoursInUTC(query.date);

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
      const businessHours = this.getBusinessHoursInUTC(query.date);
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
}

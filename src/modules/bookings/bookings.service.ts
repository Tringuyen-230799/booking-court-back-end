import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/shared/config/Prisma/prisma.service';
import {
  BookingsSchemaQuery,
  ReponseBookingCourtDetail,
} from './dto/bookings.dto';
import { getBusinessHoursInUTC } from './helpers/getBusinessHoursInUTC';
@Injectable()
export class BookingsService {
  constructor(private readonly prismaClient: PrismaService) {}

  /**
   * Helper to convert Vietnam business hours (6 AM - 11 PM) to UTC
   * for database queries
   */

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
}

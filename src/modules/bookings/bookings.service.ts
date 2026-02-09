import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/config/Prisma/prisma.service';
import {
  BookingsSchemaQuery,
  ReponseBookingCourtDetail,
} from './dto/bookings.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prismaClient: PrismaService) {}

  async findAll(query: BookingsSchemaQuery) {
    return await this.prismaClient.booking.findMany({
      where: {
        status: 'CONFIRMED',
        startTime: {
          gte: new Date(new Date(query.date).setUTCHours(6, 0, 0, 0)),
        },
        endTime: {
          lte: new Date(new Date(query.date).setUTCHours(23, 0, 0, 0)),
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
    return await this.prismaClient.booking.findMany({
      where: {
        courtId: id,
        ...(query.date && {
          startTime: {
            gte: new Date(new Date(query.date).setUTCHours(6, 0, 0, 0)),
          },
          endTime: {
            lte: new Date(new Date(query.date).setUTCHours(23, 0, 0, 0)),
          },
        }),
      },
      select: {
        id: true,
        bookingReference: true,
        startTime: true,
        endTime: true,
        status: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }
}

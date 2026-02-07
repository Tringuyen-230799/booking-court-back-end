import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/config/Prisma/prisma.service';
import { BookingsSchemaQuery } from './dto/bookings.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prismaClient: PrismaService) {}

  async findAll() {
    return await this.prismaClient.booking.findMany();
  }

  async findByCourtId(id: string, query: BookingsSchemaQuery) {
    return await this.prismaClient.booking.findMany({
      where: {
        courtId: id,
        ...(query.date && {
          startTime: {
            gte: new Date(new Date(query.date).setHours(0, 0, 0, 0)),
          },
          endTime: {
            lte: new Date(new Date(query.date).setHours(23, 59, 59, 999)),
          },
        }),
      },
    });
  }
}

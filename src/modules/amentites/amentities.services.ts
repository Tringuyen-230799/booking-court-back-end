import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/config/Prisma/prisma.service';

@Injectable()
export class AmentitiesServices {
  constructor(private prismaClient: PrismaService) {}

  async getAllAmenities() {
    return this.prismaClient.facility.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }
}

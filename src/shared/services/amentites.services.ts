import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class AmentityServices {
  private readonly prismaClient: PrismaService;

  constructor() {
    this.prismaClient = new PrismaService();
  }

  async getAllAmenities() {
    return this.prismaClient.facility.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }
}

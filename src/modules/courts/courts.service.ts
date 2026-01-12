import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/config/prisma.service';

@Injectable()
export class CourtsService {
  private readonly prismaClient: PrismaService;

  constructor() {
    this.prismaClient = new PrismaService();
  }

  async getAllCourts() {
    return await this.prismaClient.court.findMany({
      include: {
        images: true,
      },
    });
  }
}

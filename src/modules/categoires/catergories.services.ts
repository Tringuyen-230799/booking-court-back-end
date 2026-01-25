import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/config/Prisma/prisma.service';

@Injectable()
export class CatergoriesServices {
  constructor(private prismaClient: PrismaService) {}

  async getAllCategories() {
    return this.prismaClient.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }
}

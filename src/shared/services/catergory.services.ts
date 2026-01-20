import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class CatergoryServices {
  private readonly prismaClient: PrismaService;

  constructor() {
    this.prismaClient = new PrismaService();
  }

  async getAllCategories() {
    return this.prismaClient.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }
}

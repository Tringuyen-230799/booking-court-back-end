import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/config/prisma.service';
import { CourtDto, CourtQueryResult } from './courts.dto';

@Injectable()
export class CourtsService {
  private readonly prismaClient: PrismaService;

  constructor() {
    this.prismaClient = new PrismaService();
  }

  private mapToCourtDto(courts: CourtQueryResult[]): CourtDto[] {
    const mappedCourts: CourtDto[] = courts.map((court) => ({
      ...court,
      hourlyPrice: Number(court.hourlyPrice),
      eventSurcharge: Number(court.eventSurcharge),
      images: court.images.map((image) => ({
        imageUrl: image.imageUrl,
      })),
      categories: court.categories.map((category) => ({
        name: category.category?.name,
      })),
      facilities: court.facilities.map((facility) => ({
        name: facility.facility?.name,
      })),
    }));

    return mappedCourts;
  }

  async getAllCourts() {
    const data = (await this.prismaClient.court.findMany({
      include: {
        images: {
          select: {
            imageUrl: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        facilities: {
          select: {
            facility: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })) as CourtQueryResult[];

    return this.mapToCourtDto(data);
  }
}

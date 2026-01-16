import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/config/prisma.service';
import { CourtDto, CourtQueryResult } from './courts.dto';
import { QueryCourtsSchema } from './courts.schema';

@Injectable()
export class CourtsService {
  private readonly prismaClient: PrismaService;

  constructor() {
    this.prismaClient = new PrismaService();
  }

  private getCourtInclude() {
    return {
      images: { select: { imageUrl: true } },
      categories: {
        select: { category: { select: { id: true, name: true } } },
      },
      facilities: {
        select: { facility: { select: { id: true, name: true } } },
      },
    };
  }

  private mapToCourtDto(courts: CourtQueryResult[]): CourtDto[] {
    console.log('Mapping courts:', courts);

    const mappedCourts: CourtDto[] = courts.map((court) => {
      return {
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
      };
    });

    return mappedCourts;
  }

  async getAllCourts(query: QueryCourtsSchema): Promise<CourtDto[]> {
    const data = (await this.prismaClient.court.findMany({
      include: this.getCourtInclude(),
      where: {
        name: {
          contains: query.search?.trim() || undefined,
        },
        rating: {
          gte: query.rating || undefined,
        },
        ...(query.sportTypes && {
          categories: {
            some: {
              categoryId: {
                in: query.sportTypes,
              },
            },
          },
        }),
        ...(query.amenities && {
          facilities: {
            some: {
              facilityId: {
                in: query.amenities,
              },
            },
          },
        }),
        hourlyPrice: {
          gte: query.priceRange?.min || undefined,
          lte: query.priceRange?.max || undefined,
        },
      },
    })) as CourtQueryResult[];

    return this.mapToCourtDto(data);
  }
}

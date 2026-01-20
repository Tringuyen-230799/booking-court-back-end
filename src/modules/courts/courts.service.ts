import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/config/prisma.service';
import { CourtDto, CourtQueryResult } from './courts.dto';
import { QueryCourtsSchema } from './courts.schema';
import { Prisma } from 'generated/prisma';

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

  private getQueryCourtListClause(
    query?: QueryCourtsSchema,
  ): Prisma.CourtWhereInput {
    return {
      name: {
        contains: query?.search?.trim() || undefined,
      },
      rating: {
        gte: query?.rating || undefined,
      },
      ...(query?.sportTypes && {
        categories: {
          some: {
            categoryId: {
              in: query?.sportTypes,
            },
          },
        },
      }),
      ...(query?.amenities && {
        facilities: {
          some: {
            facilityId: {
              in: query?.amenities,
            },
          },
        },
      }),
      hourlyPrice: {
        gte: query?.min || undefined,
        lte: query?.max || undefined,
      },
    };
  }

  private mapToCourtDto(courts: CourtQueryResult[]): CourtDto[] {
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

  async getAllCourts(query: QueryCourtsSchema): Promise<{
    contents: CourtDto[];
    totalCount: number;
    currentPage: number;
    totalPage: number;
  }> {
    const whereClause = this.getQueryCourtListClause(query);

    const [courtList, totalCourts] = await this.prismaClient.$transaction([
      this.prismaClient.court.findMany({
        take: query.limit,
        skip: (query.page - 1) * query.limit,
        include: this.getCourtInclude(),
        where: whereClause,
      }),
      this.prismaClient.court.count({
        where: whereClause,
      }),
    ]);

    return {
      contents: this.mapToCourtDto(courtList),
      totalCount: totalCourts,
      totalPage: Math.ceil(totalCourts / query.limit),
      currentPage: query.page,
    };
  }
}

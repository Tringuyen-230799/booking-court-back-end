import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/config/Prisma/prisma.service';
import { CourtDto, CourtQueryResult } from './courts.dto';
import { QueryCourtsSchema } from './validation/courts.schema';
import { Prisma } from 'generated/prisma';

@Injectable()
export class CourtsService {
  constructor(private prismaClient: PrismaService) {}

  private getCourtInclude() {
    return {
      images: { select: { imageUrl: true, isPrimary: true } },
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
      // rating: {
      //   gte: query?.rating || undefined,
      // },
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
        hourlyPrice: Number(court?.hourlyPrice) || 0,
        eventSurcharge: Number(court?.eventSurcharge) || 0,
        images: court?.images.map((image) => ({
          imageUrl: image.imageUrl,
        })),
        categories: court?.categories.map((category) => ({
          name: category.category?.name,
        })),
        facilities: court?.facilities.map((facility) => ({
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
      totalPage: Math.ceil(totalCourts / query.limit) || 1,
      currentPage: query.page,
    };
  }

  async getCourtById(courtId: string) {
    const court = await this.prismaClient.court.findUnique({
      where: { id: courtId },
      include: this.getCourtInclude(),
    });

    if (!court) {
      return null;
    }

    // Enhance this function later
    return this.mapToCourtDto([court as CourtQueryResult])[0];
  }
}

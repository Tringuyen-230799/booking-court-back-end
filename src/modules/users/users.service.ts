import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/config/Prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaClient: PrismaService) {}

  async findUserById(id: string) {
    return await this.prismaClient.user.findUnique({
      where: {
        id,
      },
    });
  }
}

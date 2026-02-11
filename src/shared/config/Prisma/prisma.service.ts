import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma';
import pg from 'pg';
import { config } from 'dotenv';
config();

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({ adapter });
  }
}

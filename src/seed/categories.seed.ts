import { PrismaService } from '../shared/config/prisma.service';

const categoryNames = [
  'Tennis',
  'Basketball',
  'Volleyball',
  'Badminton',
  'Squash',
  'Table Tennis',
  'Pickleball',
  'Soccer',
  'Baseball',
  'Hockey',
];

export async function seedCategories(prisma: PrismaService) {
  const categories = await Promise.all(
    categoryNames.map((name) => prisma.category.create({ data: { name } })),
  );
  return categories;
}

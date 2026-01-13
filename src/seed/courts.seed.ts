import 'dotenv/config';
import { Court } from 'generated/prisma';
import { PrismaService } from 'src/shared/config/prisma.service';

const prisma = new PrismaService();

const courtNames = [
  'Sunshine Sports Center',
  'Greenfield Tennis Club',
  'Downtown Basketball Arena',
  'Lakeside Volleyball Courts',
  'Mountainview Sports Complex',
  'Riverside Badminton Hall',
];

const address = ['123 Main St', '456 Oak Ave', '789 Pine Rd', '101 Maple Blvd'];

const imageUrl = [
  'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
  'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400',
  'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=400',
  'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400',
  'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400',
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400',
  'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400',
  'https://images.unsplash.com/photo-1609906851638-9b0e6bdee9cd?w=400',
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400',
  'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
  'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400',
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
];

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data (in reverse order due to foreign keys)
  await prisma.courtImage.deleteMany({});
  await prisma.courtFacility.deleteMany({});
  await prisma.courtCategory.deleteMany({});
  await prisma.court.deleteMany({});
  await prisma.facility.deleteMany({});
  await prisma.category.deleteMany({});
}

// Helper to get random items from an array
function getRandomItems<T>(array: T[], min = 1, max = 2): T[] {
  const count = Math.max(
    min,
    Math.floor(Math.random() * (max - min + 1)) + min,
  );
  return [...array].sort(() => 0.5 - Math.random()).slice(0, count);
}

// Mock court seeding function
export async function seedMockCourts(
  count: number,
  categories: { id: number }[],
  facilities: { id: number }[],
): Promise<Court[]> {
  if (count <= 0) return [];

  const createdCourts: Court[] = [];

  for (let i = 0; i < count; i++) {
    // Use mock data arrays for more variety
    const name =
      courtNames[i % courtNames.length] +
      (count > courtNames.length
        ? ` ${Math.floor(i / courtNames.length) + 1}`
        : '');
    const addr = address[i % address.length];
    const img = imageUrl[i % imageUrl.length];

    const court = await prisma.court.create({
      data: {
        name,
        rating: Math.floor(Math.random() * 6), // 0-5
        hourlyPrice: Math.floor(Math.random() * 30) + 10, // 10-39
        eventSurcharge: Math.floor(Math.random() * 20), // 0-19
        isAvailable: Math.random() > 0.2, // 80% available
        isIndoor: Math.random() > 0.5,
        address: addr,
      },
    });

    createdCourts.push(court);

    // Assign random categories
    const randomCategories = getRandomItems(categories, 1, 2);
    await Promise.all(
      randomCategories.map((cat) =>
        prisma.courtCategory.create({
          data: { courtId: court.id, categoryId: cat.id },
        }),
      ),
    );

    // Assign random facilities
    const randomFacilities = getRandomItems(facilities, 2, 4);
    await Promise.all(
      randomFacilities.map((fac) =>
        prisma.courtFacility.create({
          data: { courtId: court.id, facilityId: fac.id },
        }),
      ),
    );

    // Add a real image from the mock array
    await prisma.courtImage.create({
      data: {
        courtId: court.id,
        imageUrl: img,
        altText: `${name} image`,
        displayOrder: 1,
        isPrimary: true,
      },
    });
  }

  return createdCourts;
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaService } from '../shared/config/prisma.service';
import { seedFacilities } from './facilities.seed';
import { seedCategories } from './categories.seed';
import { seedMockCourts } from './courts.seed';

async function main() {
  const prisma = new PrismaService();
  console.log('🌱 Starting full seed...');

  // Clean up existing data (optional: move to a shared util if needed)
  await prisma.courtImage.deleteMany({});
  await prisma.courtFacility.deleteMany({});
  await prisma.courtCategory.deleteMany({});
  await prisma.court.deleteMany({});
  await prisma.facility.deleteMany({});
  await prisma.category.deleteMany({});

  // Seed facilities and categories
  const facilities = await seedFacilities(prisma);
  const categories = await seedCategories(prisma);

  // Seed courts with references
  await seedMockCourts(300, categories, facilities);

  await prisma.$disconnect();
  console.log('✅ Seeding complete!');
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});

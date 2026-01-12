import 'dotenv/config';
import { PrismaService } from '../shared/config/prisma.service';

const prisma = new PrismaService();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data (in reverse order due to foreign keys)
  await prisma.courtImage.deleteMany({});
  await prisma.courtFacility.deleteMany({});
  await prisma.courtCategory.deleteMany({});
  await prisma.court.deleteMany({});
  await prisma.facility.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('🧹 Cleaned existing data');

  // Seed Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Basketball' },
    }),
    prisma.category.create({
      data: { name: 'Tennis' },
    }),
    prisma.category.create({
      data: { name: 'Badminton' },
    }),
    prisma.category.create({
      data: { name: 'Volleyball' },
    }),
    prisma.category.create({
      data: { name: 'Futsal' },
    }),
  ]);

  console.log(`📂 Created ${categories.length} categories`);

  // Seed Facilities
  const facilities = await Promise.all([
    prisma.facility.create({
      data: { name: 'Air Conditioning' },
    }),
    prisma.facility.create({
      data: { name: 'Parking' },
    }),
    prisma.facility.create({
      data: { name: 'Changing Room' },
    }),
    prisma.facility.create({
      data: { name: 'Shower' },
    }),
    prisma.facility.create({
      data: { name: 'Equipment Rental' },
    }),
    prisma.facility.create({
      data: { name: 'Water Fountain' },
    }),
    prisma.facility.create({
      data: { name: 'Sound System' },
    }),
    prisma.facility.create({
      data: { name: 'Lighting' },
    }),
  ]);

  console.log(`🏗️ Created ${facilities.length} facilities`);

  // Seed Courts
  const courts = await Promise.all([
    // Basketball Courts
    prisma.court.create({
      data: {
        name: 'Central Basketball Arena',
        rating: 5,
        hourlyPrice: 25.0,
        eventSurcharge: 15.0,
        isAvailable: true,
        isIndoor: true,
      },
    }),
    prisma.court.create({
      data: {
        name: 'Outdoor Basketball Court A',
        rating: 4,
        hourlyPrice: 15.0,
        eventSurcharge: 10.0,
        isAvailable: true,
        isIndoor: false,
      },
    }),

    // Tennis Courts
    prisma.court.create({
      data: {
        name: 'Premium Tennis Court 1',
        rating: 5,
        hourlyPrice: 30.0,
        eventSurcharge: 20.0,
        isAvailable: true,
        isIndoor: true,
      },
    }),
    prisma.court.create({
      data: {
        name: 'Tennis Court 2',
        rating: 4,
        hourlyPrice: 20.0,
        eventSurcharge: 12.0,
        isAvailable: true,
        isIndoor: false,
      },
    }),

    // Multi-purpose Courts
    prisma.court.create({
      data: {
        name: 'Multi-Sport Arena A',
        rating: 4,
        hourlyPrice: 22.0,
        eventSurcharge: 18.0,
        isAvailable: true,
        isIndoor: true,
      },
    }),
    prisma.court.create({
      data: {
        name: 'Multi-Sport Arena B',
        rating: 3,
        hourlyPrice: 18.0,
        eventSurcharge: 12.0,
        isAvailable: false,
        isIndoor: true,
      },
    }),

    // Badminton Courts
    prisma.court.create({
      data: {
        name: 'Badminton Hall 1',
        rating: 4,
        hourlyPrice: 12.0,
        eventSurcharge: 8.0,
        isAvailable: true,
        isIndoor: true,
      },
    }),
    prisma.court.create({
      data: {
        name: 'Badminton Hall 2',
        rating: 3,
        hourlyPrice: 10.0,
        eventSurcharge: 6.0,
        isAvailable: true,
        isIndoor: true,
      },
    }),
  ]);

  console.log(`🏟️ Created ${courts.length} courts`);

  // Create court-category relationships
  const courtCategories = [
    // Basketball courts
    { courtId: courts[0].id, categoryId: categories[0].id }, // Central Basketball Arena - Basketball
    { courtId: courts[1].id, categoryId: categories[0].id }, // Outdoor Basketball Court A - Basketball

    // Tennis courts
    { courtId: courts[2].id, categoryId: categories[1].id }, // Premium Tennis Court 1 - Tennis
    { courtId: courts[3].id, categoryId: categories[1].id }, // Tennis Court 2 - Tennis

    // Multi-purpose courts (Basketball + Volleyball + Futsal)
    { courtId: courts[4].id, categoryId: categories[0].id }, // Multi-Sport Arena A - Basketball
    { courtId: courts[4].id, categoryId: categories[3].id }, // Multi-Sport Arena A - Volleyball
    { courtId: courts[4].id, categoryId: categories[4].id }, // Multi-Sport Arena A - Futsal
    { courtId: courts[5].id, categoryId: categories[0].id }, // Multi-Sport Arena B - Basketball
    { courtId: courts[5].id, categoryId: categories[3].id }, // Multi-Sport Arena B - Volleyball

    // Badminton courts
    { courtId: courts[6].id, categoryId: categories[2].id }, // Badminton Hall 1 - Badminton
    { courtId: courts[7].id, categoryId: categories[2].id }, // Badminton Hall 2 - Badminton
  ];

  await Promise.all(
    courtCategories.map((relationship) =>
      prisma.courtCategory.create({
        data: relationship,
      }),
    ),
  );

  console.log(
    `🔗 Created ${courtCategories.length} court-category relationships`,
  );

  // Create court-facility relationships
  const courtFacilities = [
    // Central Basketball Arena (Premium facilities)
    { courtId: courts[0].id, facilityId: facilities[0].id }, // Air Conditioning
    { courtId: courts[0].id, facilityId: facilities[1].id }, // Parking
    { courtId: courts[0].id, facilityId: facilities[2].id }, // Changing Room
    { courtId: courts[0].id, facilityId: facilities[3].id }, // Shower
    { courtId: courts[0].id, facilityId: facilities[4].id }, // Equipment Rental
    { courtId: courts[0].id, facilityId: facilities[6].id }, // Sound System
    { courtId: courts[0].id, facilityId: facilities[7].id }, // Lighting

    // Outdoor Basketball Court A (Basic facilities)
    { courtId: courts[1].id, facilityId: facilities[1].id }, // Parking
    { courtId: courts[1].id, facilityId: facilities[5].id }, // Water Fountain
    { courtId: courts[1].id, facilityId: facilities[7].id }, // Lighting

    // Premium Tennis Court 1 (Premium facilities)
    { courtId: courts[2].id, facilityId: facilities[0].id }, // Air Conditioning
    { courtId: courts[2].id, facilityId: facilities[1].id }, // Parking
    { courtId: courts[2].id, facilityId: facilities[2].id }, // Changing Room
    { courtId: courts[2].id, facilityId: facilities[3].id }, // Shower
    { courtId: courts[2].id, facilityId: facilities[4].id }, // Equipment Rental
    { courtId: courts[2].id, facilityId: facilities[7].id }, // Lighting

    // Tennis Court 2 (Standard facilities)
    { courtId: courts[3].id, facilityId: facilities[1].id }, // Parking
    { courtId: courts[3].id, facilityId: facilities[2].id }, // Changing Room
    { courtId: courts[3].id, facilityId: facilities[5].id }, // Water Fountain
    { courtId: courts[3].id, facilityId: facilities[7].id }, // Lighting

    // Multi-Sport Arena A (Good facilities)
    { courtId: courts[4].id, facilityId: facilities[0].id }, // Air Conditioning
    { courtId: courts[4].id, facilityId: facilities[1].id }, // Parking
    { courtId: courts[4].id, facilityId: facilities[2].id }, // Changing Room
    { courtId: courts[4].id, facilityId: facilities[3].id }, // Shower
    { courtId: courts[4].id, facilityId: facilities[6].id }, // Sound System
    { courtId: courts[4].id, facilityId: facilities[7].id }, // Lighting

    // Multi-Sport Arena B (Standard facilities)
    { courtId: courts[5].id, facilityId: facilities[1].id }, // Parking
    { courtId: courts[5].id, facilityId: facilities[2].id }, // Changing Room
    { courtId: courts[5].id, facilityId: facilities[7].id }, // Lighting

    // Badminton Hall 1 (Good facilities)
    { courtId: courts[6].id, facilityId: facilities[0].id }, // Air Conditioning
    { courtId: courts[6].id, facilityId: facilities[1].id }, // Parking
    { courtId: courts[6].id, facilityId: facilities[2].id }, // Changing Room
    { courtId: courts[6].id, facilityId: facilities[7].id }, // Lighting

    // Badminton Hall 2 (Basic facilities)
    { courtId: courts[7].id, facilityId: facilities[1].id }, // Parking
    { courtId: courts[7].id, facilityId: facilities[5].id }, // Water Fountain
    { courtId: courts[7].id, facilityId: facilities[7].id }, // Lighting
  ];

  await Promise.all(
    courtFacilities.map((relationship) =>
      prisma.courtFacility.create({
        data: relationship,
      }),
    ),
  );

  console.log(
    `🔗 Created ${courtFacilities.length} court-facility relationships`,
  );

  // Seed Court Images (using placeholder images)
  const images = await Promise.all([
    // Central Basketball Arena (courts[0])
    prisma.courtImage.create({
      data: {
        courtId: courts[0].id,
        imageUrl:
          'https://placehold.co/800x600/2563eb/ffffff?text=Basketball+Arena+Main',
        altText: 'Central Basketball Arena main view',
        displayOrder: 1,
        isPrimary: true,
      },
    }),
    prisma.courtImage.create({
      data: {
        courtId: courts[0].id,
        imageUrl:
          'https://placehold.co/800x600/1e40af/ffffff?text=Basketball+Seating',
        altText: 'Central Basketball Arena seating area',
        displayOrder: 2,
        isPrimary: false,
      },
    }),
    prisma.courtImage.create({
      data: {
        courtId: courts[0].id,
        imageUrl:
          'https://placehold.co/800x600/1e3a8a/ffffff?text=Basketball+Court',
        altText: 'Central Basketball Arena court detail',
        displayOrder: 3,
        isPrimary: false,
      },
    }),

    // Outdoor Basketball Court A (courts[1])
    prisma.courtImage.create({
      data: {
        courtId: courts[1].id,
        imageUrl:
          'https://placehold.co/800x600/dc2626/ffffff?text=Outdoor+Basketball',
        altText: 'Outdoor Basketball Court A main view',
        displayOrder: 1,
        isPrimary: true,
      },
    }),
    prisma.courtImage.create({
      data: {
        courtId: courts[1].id,
        imageUrl:
          'https://placehold.co/800x600/b91c1c/ffffff?text=Outdoor+Court+Night',
        altText: 'Outdoor Basketball Court A at night',
        displayOrder: 2,
        isPrimary: false,
      },
    }),

    // Premium Tennis Court 1 (courts[2])
    prisma.courtImage.create({
      data: {
        courtId: courts[2].id,
        imageUrl:
          'https://placehold.co/800x600/16a34a/ffffff?text=Tennis+Court+Premium',
        altText: 'Premium Tennis Court 1 main view',
        displayOrder: 1,
        isPrimary: true,
      },
    }),
    prisma.courtImage.create({
      data: {
        courtId: courts[2].id,
        imageUrl:
          'https://placehold.co/800x600/15803d/ffffff?text=Tennis+Facilities',
        altText: 'Premium Tennis Court 1 changing room',
        displayOrder: 2,
        isPrimary: false,
      },
    }),
    prisma.courtImage.create({
      data: {
        courtId: courts[2].id,
        imageUrl:
          'https://placehold.co/800x600/166534/ffffff?text=Tennis+Equipment',
        altText: 'Premium Tennis Court 1 equipment rental area',
        displayOrder: 3,
        isPrimary: false,
      },
    }),

    // Tennis Court 2 (courts[3])
    prisma.courtImage.create({
      data: {
        courtId: courts[3].id,
        imageUrl:
          'https://placehold.co/800x600/ca8a04/ffffff?text=Tennis+Court+2',
        altText: 'Tennis Court 2 main view',
        displayOrder: 1,
        isPrimary: true,
      },
    }),
    prisma.courtImage.create({
      data: {
        courtId: courts[3].id,
        imageUrl:
          'https://placehold.co/800x600/a16207/ffffff?text=Tennis+Outdoor',
        altText: 'Tennis Court 2 outdoor view',
        displayOrder: 2,
        isPrimary: false,
      },
    }),

    // Multi-Sport Arena A (courts[4])
    prisma.courtImage.create({
      data: {
        courtId: courts[4].id,
        imageUrl:
          'https://placehold.co/800x600/7c3aed/ffffff?text=Multi+Sport+Arena',
        altText: 'Multi-Sport Arena A main view',
        displayOrder: 1,
        isPrimary: true,
      },
    }),
    prisma.courtImage.create({
      data: {
        courtId: courts[4].id,
        imageUrl:
          'https://placehold.co/800x600/6d28d9/ffffff?text=Basketball+Setup',
        altText: 'Multi-Sport Arena A basketball setup',
        displayOrder: 2,
        isPrimary: false,
      },
    }),
    prisma.courtImage.create({
      data: {
        courtId: courts[4].id,
        imageUrl:
          'https://placehold.co/800x600/5b21b6/ffffff?text=Volleyball+Setup',
        altText: 'Multi-Sport Arena A volleyball setup',
        displayOrder: 3,
        isPrimary: false,
      },
    }),

    // Multi-Sport Arena B (courts[5])
    prisma.courtImage.create({
      data: {
        courtId: courts[5].id,
        imageUrl:
          'https://placehold.co/800x600/ea580c/ffffff?text=Multi+Sport+B',
        altText: 'Multi-Sport Arena B main view',
        displayOrder: 1,
        isPrimary: true,
      },
    }),
    prisma.courtImage.create({
      data: {
        courtId: courts[5].id,
        imageUrl:
          'https://placehold.co/800x600/c2410c/ffffff?text=Arena+B+Court',
        altText: 'Multi-Sport Arena B court view',
        displayOrder: 2,
        isPrimary: false,
      },
    }),

    // Badminton Hall 1 (courts[6])
    prisma.courtImage.create({
      data: {
        courtId: courts[6].id,
        imageUrl:
          'https://placehold.co/800x600/0891b2/ffffff?text=Badminton+Hall+1',
        altText: 'Badminton Hall 1 main view',
        displayOrder: 1,
        isPrimary: true,
      },
    }),
    prisma.courtImage.create({
      data: {
        courtId: courts[6].id,
        imageUrl:
          'https://placehold.co/800x600/0e7490/ffffff?text=Badminton+Courts',
        altText: 'Badminton Hall 1 multiple courts view',
        displayOrder: 2,
        isPrimary: false,
      },
    }),
    prisma.courtImage.create({
      data: {
        courtId: courts[6].id,
        imageUrl:
          'https://placehold.co/800x600/155e75/ffffff?text=Badminton+AC',
        altText: 'Badminton Hall 1 air conditioning system',
        displayOrder: 3,
        isPrimary: false,
      },
    }),

    // Badminton Hall 2 (courts[7])
    prisma.courtImage.create({
      data: {
        courtId: courts[7].id,
        imageUrl:
          'https://placehold.co/800x600/db2777/ffffff?text=Badminton+Hall+2',
        altText: 'Badminton Hall 2 main view',
        displayOrder: 1,
        isPrimary: true,
      },
    }),
    prisma.courtImage.create({
      data: {
        courtId: courts[7].id,
        imageUrl:
          'https://placehold.co/800x600/be185d/ffffff?text=Badminton+Basic',
        altText: 'Badminton Hall 2 basic facilities',
        displayOrder: 2,
        isPrimary: false,
      },
    }),
  ]);

  console.log(`📸 Created ${images.length} court images`);

  console.log('✅ Seed completed successfully!');

  // Summary
  console.log('\n📊 Seed Summary:');
  console.log(`- Categories: ${categories.length}`);
  console.log(`- Facilities: ${facilities.length}`);
  console.log(`- Courts: ${courts.length}`);
  console.log(`- Court-Category relationships: ${courtCategories.length}`);
  console.log(`- Court-Facility relationships: ${courtFacilities.length}`);
  console.log(`- Images: ${images.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

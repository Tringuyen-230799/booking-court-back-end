import { PrismaService } from '../shared/config/prisma.service';

const facilityNames = [
  'WiFi',
  'Parking',
  'Locker Rooms',
  'Showers',
  'Equipment Rental',
  'Cafeteria',
  'Pro Shop',
  'Seating Area',
  'Lighting for Night Play',
  'Air Conditioning',
];

export async function seedFacilities(prisma: PrismaService) {
  const facilities = await Promise.all(
    facilityNames.map((name) => prisma.facility.create({ data: { name } })),
  );
  return facilities;
}

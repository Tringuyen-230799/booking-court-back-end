import { BookingStatus, PaymentStatus } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/client';
import { PrismaService } from 'src/shared/config/Prisma/prisma.service';

const prisma = new PrismaService();

function generateBookingReference(date: Date, index: number): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const sequence = String(index).padStart(3, '0');
  return `BK${year}${month}${day}${sequence}`;
}

function calculatePrice(
  hourlyPrice: number,
  startTime: Date,
  endTime: Date,
  eventSurcharge?: number | null,
): Decimal {
  const durationHours =
    (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  const baseRate = hourlyPrice + (eventSurcharge || 0);
  const price = Math.round(baseRate * durationHours * 100) / 100; // Round to 2 decimals
  return new Decimal(price);
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

/**
 * Rounds a date to the nearest 30-minute mark (e.g., 10:00, 10:30, 11:00, 11:30)
 */
function roundToHalfHour(date: Date): Date {
  const rounded = new Date(date);
  const minutes = rounded.getMinutes();
  const roundedMinutes = minutes < 30 ? 0 : 30;
  rounded.setMinutes(roundedMinutes);
  rounded.setSeconds(0);
  rounded.setMilliseconds(0);
  return rounded;
}

/**
 * Generates a valid booking time slot with start and end times on 30-minute boundaries
 * Duration options: 1h, 1.5h, or 2h
 */
function generateTimeSlot(
  start: Date,
  end: Date,
): { startTime: Date; endTime: Date } {
  const durations = [1, 1.5, 2]; // hours
  const duration = durations[Math.floor(Math.random() * durations.length)];

  // Get random date and round to half-hour
  const randomStart = randomDate(start, end);
  const startTime = roundToHalfHour(randomStart);

  // Add duration and ensure it's also on half-hour boundary
  const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

  return { startTime, endTime };
}

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export async function seedBookings() {
  console.log('🎾 Starting to seed bookings...');

  const [courts, users, categories] = await Promise.all([
    prisma.court.findMany({
      select: {
        id: true,
        hourlyPrice: true,
        eventSurcharge: true, // For special event pricing
      },
    }),
    prisma.user.findMany({
      select: { id: true },
    }),
    prisma.category.findMany({
      select: { id: true },
    }),
  ]);

  if (courts.length === 0) {
    console.log('No courts found. Please seed courts first.');
    return;
  }

  if (categories.length === 0) {
    console.log('No categories found. Please seed categories first.');
    return;
  }

  const bookings: Array<{
    bookingReference: string;
    courtId: string;
    categoryId: number;
    userId: string;
    startTime: Date;
    endTime: Date;
    status: BookingStatus;
    expiresAt: Date;
    totalPrice: Decimal;
    paymentStatus: PaymentStatus;
    paymentMethod: string | null;
    paymentId: string | null;
    paidAt: Date | null;
    notes: string | null;
  }> = [];
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Generate 50 bookings with various statuses
  for (let i = 0; i < 50; i++) {
    const court = randomItem(courts);
    const categoryId = randomItem(categories).id;
    const userId = randomItem(users).id;

    // Determine booking time based on status we want to create
    let startTime: Date;
    let endTime: Date;
    let status: BookingStatus;
    let paymentStatus: PaymentStatus;
    let expiresAt: Date;
    let paidAt: Date | null = null;
    let paymentMethod: string | null = null;
    let paymentId: string | null = null;

    const statusType = Math.random();

    if (statusType < 0.1) {
      // 10% - PENDING_PAYMENT (upcoming, not yet paid)
      const timeSlot = generateTimeSlot(now, thirtyDaysFromNow);
      startTime = timeSlot.startTime;
      endTime = timeSlot.endTime;
      status = BookingStatus.PENDING_PAYMENT;
      paymentStatus = PaymentStatus.UNPAID;
      expiresAt = new Date(startTime.getTime() - 30 * 60 * 1000); // Expires 30 min before start
    } else if (statusType < 0.15) {
      // 5% - EXPIRED (didn't pay in time)
      const timeSlot = generateTimeSlot(thirtyDaysAgo, now);
      startTime = timeSlot.startTime;
      endTime = timeSlot.endTime;
      status = BookingStatus.EXPIRED;
      paymentStatus = PaymentStatus.UNPAID;
      expiresAt = new Date(startTime.getTime() - 30 * 60 * 1000);
    } else if (statusType < 0.25) {
      // 10% - CANCELLED (paid but cancelled)
      const timeSlot = generateTimeSlot(now, thirtyDaysFromNow);
      startTime = timeSlot.startTime;
      endTime = timeSlot.endTime;
      status = BookingStatus.CANCELLED;
      paymentStatus = PaymentStatus.REFUNDED;
      expiresAt = new Date(startTime.getTime() - 30 * 60 * 1000);
      paidAt = new Date(startTime.getTime() - 3 * 24 * 60 * 60 * 1000); // Paid 3 days before
      paymentMethod = randomItem(['credit_card', 'bank_transfer', 'e-wallet']);
      paymentId = `pay_${Math.random().toString(36).substring(2, 15)}`;
    } else if (statusType < 0.5) {
      // 25% - COMPLETED (past bookings)
      const timeSlot = generateTimeSlot(thirtyDaysAgo, now);
      startTime = timeSlot.startTime;
      endTime = timeSlot.endTime;
      status = BookingStatus.COMPLETED;
      paymentStatus = PaymentStatus.PAID;
      expiresAt = new Date(startTime.getTime() - 30 * 60 * 1000);
      paidAt = new Date(startTime.getTime() - 2 * 24 * 60 * 60 * 1000); // Paid 2 days before
      paymentMethod = randomItem(['credit_card', 'bank_transfer', 'e-wallet']);
      paymentId = `pay_${Math.random().toString(36).substring(2, 15)}`;
    } else {
      // 50% - CONFIRMED (upcoming, paid)
      const timeSlot = generateTimeSlot(now, thirtyDaysFromNow);
      startTime = timeSlot.startTime;
      endTime = timeSlot.endTime;
      status = BookingStatus.CONFIRMED;
      paymentStatus = PaymentStatus.PAID;
      expiresAt = new Date(startTime.getTime() - 30 * 60 * 1000);
      paidAt = new Date(
        startTime.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      ); // Paid within last week
      paymentMethod = randomItem(['credit_card', 'bank_transfer', 'e-wallet']);
      paymentId = `pay_${Math.random().toString(36).substring(2, 15)}`;
    }

    // Calculate price from court's hourlyPrice
    // 20% of bookings get event surcharge applied (tournaments, special events)
    const applyEventSurcharge = Math.random() < 0.2 && court.eventSurcharge;
    const totalPrice = calculatePrice(
      Number(court.hourlyPrice),
      startTime,
      endTime,
      applyEventSurcharge ? Number(court.eventSurcharge) : null,
    );
    const bookingReference = generateBookingReference(startTime, i + 1);

    const notes =
      Math.random() > 0.7
        ? randomItem([
            'Need extra equipment',
            'First time booking',
            'Birthday celebration',
            'Team practice session',
            'Private coaching session',
            null,
          ])
        : null;

    bookings.push({
      bookingReference,
      courtId: court.id,
      categoryId,
      userId,
      startTime,
      endTime,
      status,
      expiresAt,
      totalPrice,
      paymentStatus,
      paymentMethod,
      paymentId,
      paidAt,
      notes,
    });
  }

  // Insert bookings
  for (const booking of bookings) {
    try {
      await prisma.booking.create({
        data: booking,
      });
      console.log('✅ Created booking:', booking.bookingReference);
    } catch (error) {
      // Skip if there's a conflict (overlapping bookings)
      console.error(error);
      console.log(`⚠️  Skipped booking due to overlap: error `);
    }
  }
}

/**
 * Clears all existing bookings
 */
export async function clearBookings() {
  console.log('🗑️  Clearing existing bookings...');
  const result = await prisma.booking.deleteMany({});
  console.log(`✅ Deleted ${result.count} bookings`);
}

// Run if executed directly
if (require.main === module) {
  seedBookings()
    .catch((e) => {
      console.error('❌ Error seeding bookings:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

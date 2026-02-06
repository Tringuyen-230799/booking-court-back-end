import { hashSync } from 'bcrypt';
import { PrismaService } from 'src/shared/config/Prisma/prisma.service';

const prisma = new PrismaService();

function hashPassword(password: string): string {
  const saltRounds = 10;
  return hashSync(password, saltRounds);
}

export async function seedUsers() {
  console.log('👤 Starting to seed users...');

  // Default password for all seed users (hashed)
  const defaultPassword = hashPassword('password123');

  const userDataList = [
    {
      email: 'john.doe@example.com',
      name: 'John Doe',
      isVerified: true,
      phoneNumber: '+1234567890',
    },
    {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      isVerified: true,
      phoneNumber: '+1234567891',
    },
    {
      email: 'mike.johnson@example.com',
      name: 'Mike Johnson',
      isVerified: true,
      phoneNumber: '+1234567892',
    },
    {
      email: 'sarah.williams@example.com',
      name: 'Sarah Williams',
      isVerified: true,
      phoneNumber: null,
    },
    {
      email: 'david.brown@example.com',
      name: 'David Brown',
      isVerified: true,
      phoneNumber: '+1234567894',
    },
    {
      email: 'emily.davis@example.com',
      name: 'Emily Davis',
      isVerified: false,
      phoneNumber: null,
    },
    {
      email: 'robert.miller@example.com',
      name: 'Robert Miller',
      isVerified: true,
      phoneNumber: '+1234567896',
    },
    {
      email: 'lisa.wilson@example.com',
      name: 'Lisa Wilson',
      isVerified: false,
      phoneNumber: '+1234567897',
    },
    {
      email: 'james.moore@example.com',
      name: 'James Moore',
      isVerified: true,
      phoneNumber: null,
    },
    {
      email: 'anna.taylor@example.com',
      name: 'Anna Taylor',
      isVerified: true,
      phoneNumber: '+1234567899',
    },
    {
      email: 'chris.anderson@example.com',
      name: 'Chris Anderson',
      isVerified: false,
      phoneNumber: null,
    },
    {
      email: 'michelle.thomas@example.com',
      name: 'Michelle Thomas',
      isVerified: true,
      phoneNumber: '+1234567801',
    },
    {
      email: 'kevin.jackson@example.com',
      name: 'Kevin Jackson',
      isVerified: true,
      phoneNumber: '+1234567802',
    },
    {
      email: 'laura.white@example.com',
      name: 'Laura White',
      isVerified: true,
      phoneNumber: null,
    },
    {
      email: 'daniel.harris@example.com',
      name: 'Daniel Harris',
      isVerified: false,
      phoneNumber: '+1234567804',
    },
  ];

  for (const userData of userDataList) {
    try {
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: defaultPassword,
        },
      });
      console.log(`✅ Created user: ${user.email}`);
    } catch (error) {
      console.error(error);
      console.log(`⚠️  Skipped user (already exists): ${userData.email}`);
    }
  }
}

/**
 * Clears all existing users
 * WARNING: This will cascade delete all bookings associated with users
 */
export async function clearUsers() {
  console.log('🗑️  Clearing existing users...');
  const result = await prisma.user.deleteMany({});
  console.log(`✅ Deleted ${result.count} users`);
}

// Run if executed directly
if (require.main === module) {
  seedUsers()
    .catch((e) => {
      console.error('❌ Error seeding users:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

/**
 * Seed script to create demo staff accounts
 * Run with: npm run seed
 * Force re-seed (drops existing staff): npm run seed -- --force
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import Staff from './src/models/Staff.js';
import { connectDatabase } from './src/config/db.js';

const demoStaff = [
  {
    email: 'receptionist@clinic.com',
    name: 'Alice Receptionist',
    role: 'receptionist',
    isActive: true,
    passwordHash: 'password123' // Will be hashed by pre-save hook
  },
  {
    email: 'doctor@clinic.com',
    name: 'Dr. Bob Smith',
    role: 'doctor',
    isActive: true,
    passwordHash: 'password123'
  },
  {
    email: 'admin@clinic.com',
    name: 'Admin User',
    role: 'admin',
    isActive: true,
    passwordHash: 'password123'
  }
];

/**
 * Seed database with demo staff
 */
async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to database
    await connectDatabase(process.env.MONGODB_URI);

    const forceReseed = process.argv.includes('--force');

    // Check if staff already exists
    const existingStaff = await Staff.countDocuments();
    if (existingStaff > 0) {
      if (!forceReseed) {
        console.log(`⚠️  Database already has ${existingStaff} staff members. Skipping seed.`);
        console.log('💡 Run with --force to wipe existing staff and re-seed.');
        process.exit(0);
      }
      console.log(`🗑️  Force flag set — deleting ${existingStaff} existing staff...`);
      await Staff.deleteMany({});
    }

    // IMPORTANT: Use Staff.create() one-by-one so the pre-save bcrypt hook fires.
    // Staff.insertMany() bypasses pre-save hooks and would store passwords as plain text.
    console.log(`📝 Creating ${demoStaff.length} demo staff accounts (passwords will be hashed)...`);
    const created = [];
    for (const data of demoStaff) {
      const s = await Staff.create(data);
      created.push(s);
      console.log(`  ✓ Created: ${s.email} (${s.role})`);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\n🔐 Demo Credentials:');
    created.forEach((staff) => {
      console.log(`  - ${staff.email} (${staff.role}) / password123`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seed();

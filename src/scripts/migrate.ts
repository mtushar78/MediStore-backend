import { execSync } from 'child_process';
import * as path from 'path';

/**
 * Migration script for production deployment
 * Runs Prisma migrations and generates client
 */

async function runMigrations() {
  try {
    console.log('🚀 Starting database migration...');

    // Get the schema path
    const schemaPath = path.join(__dirname, '../../prisma/schema.prisma');
    console.log(`📁 Schema path: ${schemaPath}`);

    // Run Prisma migrate deploy (for production)
    console.log('📦 Running Prisma migrate deploy...');
    execSync(`npx prisma migrate deploy --schema=${schemaPath}`, {
      stdio: 'inherit',
      env: process.env,
    });

    // Generate Prisma Client
    console.log('🔧 Generating Prisma Client...');
    execSync(`npx prisma generate --schema=${schemaPath}`, {
      stdio: 'inherit',
      env: process.env,
    });

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();

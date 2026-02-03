import dotenv from 'dotenv';
import { prisma } from '../db/prisma';

dotenv.config();

/**
 * Script to update all medicine images with Unsplash images
 * Uses medicine/pharmacy themed images from Unsplash
 */

const unsplashImages = [
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&h=600&fit=crop', // Pills and tablets
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop', // Medicine bottles
  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&h=600&fit=crop', // Pharmacy shelves
  'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&h=600&fit=crop', // Pills in hand
  'https://images.unsplash.com/photo-1550572017-4a6e8e8e4e8e?w=800&h=600&fit=crop', // Medicine capsules
  'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=800&h=600&fit=crop', // Pharmacy counter
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop', // Medical supplies
  'https://images.unsplash.com/photo-1587854680352-936b22b91030?w=800&h=600&fit=crop', // Pills and medicine
  'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800&h=600&fit=crop', // Pharmacy bottles
  'https://images.unsplash.com/photo-1550572017-4a6e8e8e4e8e?w=800&h=600&fit=crop', // Tablets
  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&h=600&fit=crop', // Medicine shelf
  'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&h=600&fit=crop', // Pills close-up
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&h=600&fit=crop', // Medication
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop', // Pharmacy products
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop', // Medical items
  'https://images.unsplash.com/photo-1587854680352-936b22b91030?w=800&h=600&fit=crop', // Pills array
  'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800&h=600&fit=crop', // Medicine bottles
  'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=800&h=600&fit=crop', // Pharmacy interior
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop', // Medical products
  'https://images.unsplash.com/photo-1550572017-4a6e8e8e4e8e?w=800&h=600&fit=crop', // Capsules
  'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&h=600&fit=crop', // Pills in container
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&h=600&fit=crop', // Tablets close
];

const main = async () => {
  console.log('🖼️  Starting medicine image update...\n');

  // Get all medicines
  const medicines = await prisma.medicine.findMany({
    select: { id: true, name: true, images: true },
  });

  console.log(`📦 Found ${medicines.length} medicines to update\n`);

  let updated = 0;
  let failed = 0;

  // Update each medicine with a unique Unsplash image
  for (let i = 0; i < medicines.length; i++) {
    const medicine = medicines[i];
    const imageIndex = i % unsplashImages.length;
    const newImage = unsplashImages[imageIndex];

    try {
      await prisma.medicine.update({
        where: { id: medicine.id },
        data: {
          images: [newImage],
        },
      });

      console.log(`✅ Updated: ${medicine.name}`);
      updated++;
    } catch (error) {
      console.error(`❌ Failed to update ${medicine.name}:`, error);
      failed++;
    }
  }

  console.log('\n📊 Update Summary:');
  console.log('==================');
  console.log(`✅ Successfully updated: ${updated} medicines`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed} medicines`);
  }
  console.log('\n✅ Medicine images updated successfully!\n');
};

main()
  .catch(async (e) => {
    console.error('❌ Update failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import crypto from 'crypto';
import dotenv from 'dotenv';
import { prisma } from '../db/prisma';

dotenv.config();

const hashPassword = (password: string) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/**
 * Comprehensive seed script that creates:
 * - Admin user
 * - Seller users
 * - Customer users
 * - Categories
 * - Medicines
 */

const main = async () => {
  console.log('🌱 Starting comprehensive database seeding...\n');

  // ========== ADMIN USER ==========
  console.log('👤 Creating admin user...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@medistore.com' },
    create: {
      name: 'Admin User',
      email: 'admin@medistore.com',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
      status: 'active',
    },
    update: {
      role: 'admin',
      status: 'active',
    },
  });
  console.log(`✅ Admin created: ${admin.email}\n`);

  // ========== SELLER USERS ==========
  console.log('🏪 Creating seller users...');
  const sellers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'seller1@medistore.com' },
      create: {
        name: 'Square Pharmaceuticals',
        email: 'seller1@medistore.com',
        passwordHash: hashPassword('seller123'),
        role: 'seller',
        status: 'active',
        phone: '+8801711111111',
      },
      update: { role: 'seller', status: 'active' },
    }),
    prisma.user.upsert({
      where: { email: 'seller2@medistore.com' },
      create: {
        name: 'Beximco Pharma',
        email: 'seller2@medistore.com',
        passwordHash: hashPassword('seller123'),
        role: 'seller',
        status: 'active',
        phone: '+8801722222222',
      },
      update: { role: 'seller', status: 'active' },
    }),
  ]);
  console.log(`✅ Created ${sellers.length} sellers\n`);

  // ========== CUSTOMER USERS ==========
  console.log('👥 Creating customer users...');
  const customers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'customer1@example.com' },
      create: {
        name: 'John Doe',
        email: 'customer1@example.com',
        passwordHash: hashPassword('customer123'),
        role: 'customer',
        status: 'active',
        phone: '+8801733333333',
        address: {
          addressLine1: '123 Main Street',
          city: 'Dhaka',
          area: 'Gulshan',
          postalCode: '1212',
        },
      },
      update: { role: 'customer', status: 'active' },
    }),
    prisma.user.upsert({
      where: { email: 'customer2@example.com' },
      create: {
        name: 'Jane Smith',
        email: 'customer2@example.com',
        passwordHash: hashPassword('customer123'),
        role: 'customer',
        status: 'active',
        phone: '+8801744444444',
        address: {
          addressLine1: '456 Park Avenue',
          city: 'Chittagong',
          area: 'Agrabad',
          postalCode: '4100',
        },
      },
      update: { role: 'customer', status: 'active' },
    }),
  ]);
  console.log(`✅ Created ${customers.length} customers\n`);

  // ========== CATEGORIES ==========
  console.log('📂 Creating categories...');
  const categoryData = [
    { name: 'Pain Relief', description: 'Analgesics for headaches, muscle pain and general aches.' },
    { name: 'Cold & Flu', description: 'Symptom relief for cold, cough, fever and flu.' },
    { name: 'Allergy', description: 'Antihistamines and related allergy relief.' },
    { name: 'Digestive Health', description: 'For acidity, reflux, diarrhea, constipation and gut comfort.' },
    { name: 'Vitamins & Supplements', description: 'Daily vitamins, minerals and supplements.' },
    { name: 'Diabetes Care', description: 'Medicines and supplies to help manage diabetes.' },
    { name: 'Heart & Blood Pressure', description: 'Medicines for cardiovascular health.' },
    { name: 'Skin Care', description: 'Topicals for acne, rashes, fungal infections and irritation.' },
    { name: 'Eye Care', description: 'Drops and ointments for dry eyes and irritation.' },
    { name: 'Antibiotics', description: 'Prescription antibiotics.' },
  ];

  const categories = await Promise.all(
    categoryData.map((cat) =>
      prisma.category.upsert({
        where: { slug: slugify(cat.name) },
        create: {
          name: cat.name,
          slug: slugify(cat.name),
          description: cat.description,
          isActive: true,
        },
        update: {
          name: cat.name,
          description: cat.description,
          isActive: true,
        },
      }),
    ),
  );
  console.log(`✅ Created ${categories.length} categories\n`);

  // ========== MEDICINES ==========
  console.log('💊 Creating medicines...');
  const medicineData: Array<{
    name: string;
    categoryName: string;
    manufacturer: string;
    unit: string;
    price: number;
    stock: number;
    description: string;
    sellerIndex: number;
  }> = [
    // Pain Relief
    { name: 'Napa', categoryName: 'Pain Relief', manufacturer: 'Beximco Pharma', unit: 'tablet', price: 2.5, stock: 500, description: 'Paracetamol 500mg for fever and pain relief', sellerIndex: 0 },
    { name: 'Ace Plus', categoryName: 'Pain Relief', manufacturer: 'Square Pharmaceuticals', unit: 'tablet', price: 3.0, stock: 300, description: 'Paracetamol + Caffeine for headache', sellerIndex: 1 },
    { name: 'Flexi', categoryName: 'Pain Relief', manufacturer: 'Square Pharmaceuticals', unit: 'tablet', price: 8.0, stock: 200, description: 'Naproxen for muscle pain and inflammation', sellerIndex: 0 },
    
    // Cold & Flu
    { name: 'Fexo', categoryName: 'Cold & Flu', manufacturer: 'Square Pharmaceuticals', unit: 'tablet', price: 5.0, stock: 400, description: 'Fexofenadine for cold and allergy symptoms', sellerIndex: 1 },
    { name: 'Alatrol', categoryName: 'Cold & Flu', manufacturer: 'Incepta Pharmaceuticals', unit: 'syrup', price: 85.0, stock: 150, description: 'Cetirizine syrup for cold relief', sellerIndex: 0 },
    
    // Allergy
    { name: 'Histacin', categoryName: 'Allergy', manufacturer: 'Square Pharmaceuticals', unit: 'tablet', price: 4.0, stock: 350, description: 'Cetirizine for allergy relief', sellerIndex: 1 },
    { name: 'Montair', categoryName: 'Allergy', manufacturer: 'Beximco Pharma', unit: 'tablet', price: 6.0, stock: 250, description: 'Montelukast for allergic rhinitis', sellerIndex: 0 },
    
    // Digestive Health
    { name: 'Seclo', categoryName: 'Digestive Health', manufacturer: 'Square Pharmaceuticals', unit: 'capsule', price: 7.0, stock: 300, description: 'Omeprazole for acidity and GERD', sellerIndex: 1 },
    { name: 'Antacid', categoryName: 'Digestive Health', manufacturer: 'ACI Limited', unit: 'syrup', price: 120.0, stock: 100, description: 'Antacid suspension for quick relief', sellerIndex: 0 },
    { name: 'Orsaline', categoryName: 'Digestive Health', manufacturer: 'Renata Limited', unit: 'powder', price: 10.0, stock: 500, description: 'Oral rehydration salts', sellerIndex: 1 },
    
    // Vitamins & Supplements
    { name: 'Multivit', categoryName: 'Vitamins & Supplements', manufacturer: 'Square Pharmaceuticals', unit: 'tablet', price: 5.0, stock: 400, description: 'Multivitamin and mineral supplement', sellerIndex: 0 },
    { name: 'Calcium D', categoryName: 'Vitamins & Supplements', manufacturer: 'Beximco Pharma', unit: 'tablet', price: 8.0, stock: 300, description: 'Calcium with Vitamin D3', sellerIndex: 1 },
    { name: 'Vitamin C', categoryName: 'Vitamins & Supplements', manufacturer: 'ACI Limited', unit: 'tablet', price: 3.0, stock: 600, description: 'Vitamin C 500mg for immunity', sellerIndex: 0 },
    
    // Diabetes Care
    { name: 'Glucomin', categoryName: 'Diabetes Care', manufacturer: 'Square Pharmaceuticals', unit: 'tablet', price: 4.0, stock: 250, description: 'Metformin for diabetes management', sellerIndex: 1 },
    { name: 'Glimisave', categoryName: 'Diabetes Care', manufacturer: 'Beximco Pharma', unit: 'tablet', price: 6.0, stock: 200, description: 'Glimepiride for type 2 diabetes', sellerIndex: 0 },
    
    // Heart & Blood Pressure
    { name: 'Amlodac', categoryName: 'Heart & Blood Pressure', manufacturer: 'Square Pharmaceuticals', unit: 'tablet', price: 5.0, stock: 300, description: 'Amlodipine for hypertension', sellerIndex: 1 },
    { name: 'Atenolol', categoryName: 'Heart & Blood Pressure', manufacturer: 'Incepta Pharmaceuticals', unit: 'tablet', price: 3.0, stock: 350, description: 'Beta blocker for blood pressure', sellerIndex: 0 },
    
    // Skin Care
    { name: 'Dermosol', categoryName: 'Skin Care', manufacturer: 'Square Pharmaceuticals', unit: 'cream', price: 150.0, stock: 100, description: 'Antifungal cream for skin infections', sellerIndex: 1 },
    { name: 'Acnovate', categoryName: 'Skin Care', manufacturer: 'Beximco Pharma', unit: 'gel', price: 200.0, stock: 80, description: 'Benzoyl peroxide gel for acne', sellerIndex: 0 },
    
    // Eye Care
    { name: 'Refresh Tears', categoryName: 'Eye Care', manufacturer: 'Renata Limited', unit: 'drops', price: 180.0, stock: 120, description: 'Artificial tears for dry eyes', sellerIndex: 1 },
    
    // Antibiotics
    { name: 'Amoxi', categoryName: 'Antibiotics', manufacturer: 'Square Pharmaceuticals', unit: 'capsule', price: 8.0, stock: 200, description: 'Amoxicillin 500mg antibiotic', sellerIndex: 0 },
    { name: 'Azithro', categoryName: 'Antibiotics', manufacturer: 'Beximco Pharma', unit: 'tablet', price: 15.0, stock: 150, description: 'Azithromycin for bacterial infections', sellerIndex: 1 },
  ];

  const medicines = await Promise.all(
    medicineData.map((med) => {
      const category = categories.find((c) => c.name === med.categoryName);
      const seller = sellers[med.sellerIndex];
      const slug = slugify(`${med.name}-${med.manufacturer}`);

      return prisma.medicine.upsert({
        where: { slug },
        create: {
          name: med.name,
          slug,
          categoryId: category!.id,
          sellerId: seller.id,
          manufacturer: med.manufacturer,
          unit: med.unit,
          price: med.price,
          stock: med.stock,
          images: [`https://picsum.photos/seed/${encodeURIComponent(slug)}/600/400`],
          description: med.description,
          isActive: true,
        },
        update: {
          name: med.name,
          categoryId: category!.id,
          sellerId: seller.id,
          manufacturer: med.manufacturer,
          unit: med.unit,
          price: med.price,
          stock: med.stock,
          description: med.description,
          isActive: true,
        },
      });
    }),
  );
  console.log(`✅ Created ${medicines.length} medicines\n`);

  // ========== SUMMARY ==========
  console.log('📊 Seeding Summary:');
  console.log('==================');
  console.log(`👤 Admin: ${admin.email} (password: admin123)`);
  console.log(`🏪 Sellers: ${sellers.length}`);
  sellers.forEach((s) => console.log(`   - ${s.email} (password: seller123)`));
  console.log(`👥 Customers: ${customers.length}`);
  customers.forEach((c) => console.log(`   - ${c.email} (password: customer123)`));
  console.log(`📂 Categories: ${categories.length}`);
  console.log(`💊 Medicines: ${medicines.length}`);
  console.log('\n✅ Database seeding completed successfully!\n');
};

main()
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
